using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechGear.Api.Data;
using TechGear.Api.Dtos.Addresses;
using TechGear.Api.Models;

namespace TechGear.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AddressesController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;

    public AddressesController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ShippingAddressDto>>> GetMine()
    {
        var userId = GetUserId();
        var addresses = await _dbContext.ShippingAddresses
            .AsNoTracking()
            .Where(address => address.UserId == userId)
            .OrderByDescending(address => address.IsDefault)
            .ThenBy(address => address.Id)
            .ToListAsync();

        return Ok(addresses.Select(MapAddress));
    }

    [HttpPost]
    public async Task<ActionResult<ShippingAddressDto>> Create(UpsertShippingAddressRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.AddressLine1) ||
            string.IsNullOrWhiteSpace(request.City) ||
            string.IsNullOrWhiteSpace(request.PostalCode) ||
            string.IsNullOrWhiteSpace(request.Country))
        {
            return BadRequest("AddressLine1, City, PostalCode and Country are required.");
        }

        var userId = GetUserId();
        var hasAddresses = await _dbContext.ShippingAddresses.AnyAsync(address => address.UserId == userId);

        var address = new ShippingAddress
        {
            UserId = userId,
            Label = request.Label.Trim(),
            RecipientName = request.RecipientName.Trim(),
            PhoneNumber = request.PhoneNumber.Trim(),
            AddressLine1 = request.AddressLine1.Trim(),
            AddressLine2 = request.AddressLine2.Trim(),
            City = request.City.Trim(),
            State = request.State.Trim(),
            PostalCode = request.PostalCode.Trim(),
            Country = request.Country.Trim(),
            IsDefault = request.IsDefault || !hasAddresses
        };

        if (address.IsDefault)
        {
            await ClearDefaultAddressAsync(userId);
        }

        _dbContext.ShippingAddresses.Add(address);
        await _dbContext.SaveChangesAsync();

        return Ok(MapAddress(address));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ShippingAddressDto>> Update(int id, UpsertShippingAddressRequestDto request)
    {
        var userId = GetUserId();
        var address = await _dbContext.ShippingAddresses.FirstOrDefaultAsync(item => item.Id == id && item.UserId == userId);

        if (address is null)
        {
            return NotFound();
        }

        address.Label = request.Label.Trim();
        address.RecipientName = request.RecipientName.Trim();
        address.PhoneNumber = request.PhoneNumber.Trim();
        address.AddressLine1 = request.AddressLine1.Trim();
        address.AddressLine2 = request.AddressLine2.Trim();
        address.City = request.City.Trim();
        address.State = request.State.Trim();
        address.PostalCode = request.PostalCode.Trim();
        address.Country = request.Country.Trim();

        if (request.IsDefault)
        {
            await ClearDefaultAddressAsync(userId);
            address.IsDefault = true;
        }
        else
        {
            var hasOtherDefault = await _dbContext.ShippingAddresses
                .AnyAsync(item => item.UserId == userId && item.Id != id && item.IsDefault);
            address.IsDefault = !hasOtherDefault;
        }

        await _dbContext.SaveChangesAsync();
        return Ok(MapAddress(address));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        var address = await _dbContext.ShippingAddresses.FirstOrDefaultAsync(item => item.Id == id && item.UserId == userId);

        if (address is null)
        {
            return NotFound();
        }

        var wasDefault = address.IsDefault;
        _dbContext.ShippingAddresses.Remove(address);
        await _dbContext.SaveChangesAsync();

        if (wasDefault)
        {
            var fallback = await _dbContext.ShippingAddresses
                .Where(item => item.UserId == userId)
                .OrderBy(item => item.Id)
                .FirstOrDefaultAsync();

            if (fallback is not null)
            {
                fallback.IsDefault = true;
                await _dbContext.SaveChangesAsync();
            }
        }

        return NoContent();
    }

    private string GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("User id claim not found.");
    }

    private async Task ClearDefaultAddressAsync(string userId)
    {
        var defaults = await _dbContext.ShippingAddresses
            .Where(address => address.UserId == userId && address.IsDefault)
            .ToListAsync();

        foreach (var item in defaults)
        {
            item.IsDefault = false;
        }
    }

    private static ShippingAddressDto MapAddress(ShippingAddress address)
    {
        return new ShippingAddressDto
        {
            Id = address.Id,
            Label = address.Label,
            RecipientName = address.RecipientName,
            PhoneNumber = address.PhoneNumber,
            AddressLine1 = address.AddressLine1,
            AddressLine2 = address.AddressLine2,
            City = address.City,
            State = address.State,
            PostalCode = address.PostalCode,
            Country = address.Country,
            IsDefault = address.IsDefault
        };
    }
}