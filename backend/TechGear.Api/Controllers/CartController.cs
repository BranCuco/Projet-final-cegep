using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechGear.Api.Data;
using TechGear.Api.Dtos.Cart;
using TechGear.Api.Models;

namespace TechGear.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;

    public CartController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CartItemResponseDto>>> GetMine()
    {
        var userId = GetUserId();
        var cartItems = await _dbContext.CartItems
            .AsNoTracking()
            .Include(c => c.Product)
            .Where(c => c.UserId == userId)
            .ToListAsync();

        var response = cartItems.Select(c => new CartItemResponseDto
        {
            Id = c.Id,
            ProductId = c.ProductId,
            ProductName = c.Product?.Name ?? string.Empty,
            ProductImageUrl = c.Product?.ImageUrl ?? string.Empty,
            UnitPrice = c.Product?.Price ?? 0,
            Quantity = c.Quantity,
            LineTotal = (c.Product?.Price ?? 0) * c.Quantity
        });

        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<CartItemResponseDto>> Add(CartItemRequestDto request)
    {
        if (request.Quantity <= 0)
        {
            return BadRequest("Quantity must be greater than 0.");
        }

        var userId = GetUserId();
        var product = await _dbContext.Products.FindAsync(request.ProductId);

        if (product is null)
        {
            return NotFound("Product not found.");
        }

        var existing = await _dbContext.CartItems
            .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == request.ProductId);

        if (existing is null)
        {
            existing = new CartItem
            {
                UserId = userId,
                ProductId = request.ProductId,
                Quantity = request.Quantity
            };
            _dbContext.CartItems.Add(existing);
        }
        else
        {
            existing.Quantity += request.Quantity;
        }

        if (existing.Quantity > product.InventoryCount)
        {
            return BadRequest("Requested quantity exceeds inventory.");
        }

        await _dbContext.SaveChangesAsync();

        return Ok(new CartItemResponseDto
        {
            Id = existing.Id,
            ProductId = existing.ProductId,
            ProductName = product.Name,
            ProductImageUrl = product.ImageUrl,
            UnitPrice = product.Price,
            Quantity = existing.Quantity,
            LineTotal = product.Price * existing.Quantity
        });
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CartItemResponseDto>> UpdateQuantity(int id, CartItemRequestDto request)
    {
        if (request.Quantity <= 0)
        {
            return BadRequest("Quantity must be greater than 0.");
        }

        var userId = GetUserId();
        var item = await _dbContext.CartItems
            .Include(c => c.Product)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (item is null)
        {
            return NotFound();
        }

        var product = item.Product;
        if (product is null)
        {
            return NotFound("Product not found.");
        }

        if (request.Quantity > product.InventoryCount)
        {
            return BadRequest("Requested quantity exceeds inventory.");
        }

        item.Quantity = request.Quantity;
        await _dbContext.SaveChangesAsync();

        return Ok(new CartItemResponseDto
        {
            Id = item.Id,
            ProductId = item.ProductId,
            ProductName = product.Name,
            ProductImageUrl = product.ImageUrl,
            UnitPrice = product.Price,
            Quantity = item.Quantity,
            LineTotal = product.Price * item.Quantity
        });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Remove(int id)
    {
        var userId = GetUserId();
        var item = await _dbContext.CartItems.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (item is null)
        {
            return NotFound();
        }

        _dbContext.CartItems.Remove(item);
        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete]
    public async Task<IActionResult> ClearMine()
    {
        var userId = GetUserId();
        var items = await _dbContext.CartItems.Where(c => c.UserId == userId).ToListAsync();
        _dbContext.CartItems.RemoveRange(items);
        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    private string GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("User id claim not found.");
    }
}