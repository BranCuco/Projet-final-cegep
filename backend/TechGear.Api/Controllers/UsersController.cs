using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TechGear.Api.Dtos.Users;
using TechGear.Api.Models;

namespace TechGear.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;

    public UsersController(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserProfileDto>> GetMe()
    {
        var user = await GetCurrentUserAsync();
        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(await MapUserProfileAsync(user));
    }

    [HttpPut("me")]
    public async Task<ActionResult<UserProfileDto>> UpdateMe(UpdateUserProfileRequestDto request)
    {
        var user = await GetCurrentUserAsync();
        if (user is null)
        {
            return Unauthorized();
        }

        var currentEmail = user.Email ?? string.Empty;
        var nextEmail = request.Email.Trim();

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.ShippingAddressLine1 = request.ShippingAddressLine1.Trim();
        user.ShippingAddressLine2 = request.ShippingAddressLine2.Trim();
        user.ShippingCity = request.ShippingCity.Trim();
        user.ShippingState = request.ShippingState.Trim();
        user.ShippingPostalCode = request.ShippingPostalCode.Trim();
        user.ShippingCountry = request.ShippingCountry.Trim();

        if (!string.Equals(currentEmail, nextEmail, StringComparison.OrdinalIgnoreCase))
        {
            var setEmailResult = await _userManager.SetEmailAsync(user, nextEmail);
            if (!setEmailResult.Succeeded)
            {
                return BadRequest(setEmailResult.Errors.Select(error => error.Description));
            }

            var setUserNameResult = await _userManager.SetUserNameAsync(user, nextEmail);
            if (!setUserNameResult.Succeeded)
            {
                return BadRequest(setUserNameResult.Errors.Select(error => error.Description));
            }
        }

        if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
        {
            var phoneResult = await _userManager.SetPhoneNumberAsync(user, request.PhoneNumber.Trim());
            if (!phoneResult.Succeeded)
            {
                return BadRequest(phoneResult.Errors.Select(error => error.Description));
            }
        }

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors.Select(error => error.Description));
        }

        return Ok(await MapUserProfileAsync(user));
    }

    private async Task<ApplicationUser?> GetCurrentUserAsync()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return null;
        }

        return await _userManager.FindByIdAsync(userId);
    }

    private async Task<UserProfileDto> MapUserProfileAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);

        return new UserProfileDto
        {
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber ?? string.Empty,
            ShippingAddressLine1 = user.ShippingAddressLine1,
            ShippingAddressLine2 = user.ShippingAddressLine2,
            ShippingCity = user.ShippingCity,
            ShippingState = user.ShippingState,
            ShippingPostalCode = user.ShippingPostalCode,
            ShippingCountry = user.ShippingCountry,
            Roles = roles
        };
    }
}