using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechGear.Api.Data;
using TechGear.Api.Dtos.Orders;
using TechGear.Api.Models;

namespace TechGear.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;

    public OrdersController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpPost]
    public async Task<ActionResult<OrderResponseDto>> CreateFromCart()
    {
        var userId = GetUserId();

        var cartItems = await _dbContext.CartItems
            .Include(c => c.Product)
            .Where(c => c.UserId == userId)
            .ToListAsync();

        if (cartItems.Count == 0)
        {
            return BadRequest("Cart is empty.");
        }

        foreach (var cartItem in cartItems)
        {
            if (cartItem.Product is null)
            {
                return BadRequest("One product in cart no longer exists.");
            }

            if (cartItem.Quantity > cartItem.Product.InventoryCount)
            {
                return BadRequest($"Insufficient stock for {cartItem.Product.Name}.");
            }
        }

        var order = new Order
        {
            UserId = userId,
            CreatedAtUtc = DateTime.UtcNow
        };

        foreach (var cartItem in cartItems)
        {
            var product = cartItem.Product!;
            product.InventoryCount -= cartItem.Quantity;

            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductNameSnapshot = product.Name,
                UnitPriceSnapshot = product.Price,
                Quantity = cartItem.Quantity
            });
        }

        order.TotalAmount = order.Items.Sum(i => i.UnitPriceSnapshot * i.Quantity);

        _dbContext.Orders.Add(order);
        _dbContext.CartItems.RemoveRange(cartItems);
        await _dbContext.SaveChangesAsync();

        var response = new OrderResponseDto
        {
            Id = order.Id,
            UserId = order.UserId,
            CreatedAtUtc = order.CreatedAtUtc,
            TotalAmount = order.TotalAmount,
            Items = order.Items.Select(i => new OrderItemResponseDto
            {
                ProductId = i.ProductId,
                ProductName = i.ProductNameSnapshot,
                UnitPrice = i.UnitPriceSnapshot,
                Quantity = i.Quantity,
                LineTotal = i.UnitPriceSnapshot * i.Quantity
            }).ToList()
        };

        return Ok(response);
    }

    [HttpGet("mine")]
    public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetMine()
    {
        var userId = GetUserId();

        var orders = await _dbContext.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAtUtc)
            .ToListAsync();

        var response = orders.Select(MapOrder);
        return Ok(response);
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetAll()
    {
        var orders = await _dbContext.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAtUtc)
            .ToListAsync();

        var response = orders.Select(MapOrder);
        return Ok(response);
    }

    private static OrderResponseDto MapOrder(Order order)
    {
        return new OrderResponseDto
        {
            Id = order.Id,
            UserId = order.UserId,
            CreatedAtUtc = order.CreatedAtUtc,
            TotalAmount = order.TotalAmount,
            Items = order.Items.Select(i => new OrderItemResponseDto
            {
                ProductId = i.ProductId,
                ProductName = i.ProductNameSnapshot,
                UnitPrice = i.UnitPriceSnapshot,
                Quantity = i.Quantity,
                LineTotal = i.UnitPriceSnapshot * i.Quantity
            }).ToList()
        };
    }

    private string GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("User id claim not found.");
    }
}