using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
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
    private readonly UserManager<ApplicationUser> _userManager;

    public OrdersController(ApplicationDbContext dbContext, UserManager<ApplicationUser> userManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
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
            StripeSessionId = $"manual-{Guid.NewGuid():N}",
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
            UserEmail = string.Empty,
            StripeSessionId = order.StripeSessionId,
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
            .Include(o => o.User)
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAtUtc)
            .ToListAsync();

        var response = orders.Select(MapOrder);
        return Ok(response);
    }

    [HttpPost("from-checkout")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<OrderResponseDto>> CreateFromCheckout([FromBody] CreateCheckoutOrderRequestDto request)
    {
        var stripeSessionId = request.StripeSessionId.Trim();
        var customerEmail = request.CustomerEmail.Trim();

        if (string.IsNullOrWhiteSpace(stripeSessionId))
        {
            return BadRequest("Stripe session id is required.");
        }

        if (string.IsNullOrWhiteSpace(customerEmail))
        {
            return BadRequest("Customer email is required.");
        }

        if (request.Items.Count == 0)
        {
            return BadRequest("Checkout items are required.");
        }

        var existingOrder = await _dbContext.Orders
            .AsNoTracking()
            .Include(order => order.User)
            .Include(order => order.Items)
            .FirstOrDefaultAsync(order => order.StripeSessionId == stripeSessionId);

        if (existingOrder is not null)
        {
            return Ok(MapOrder(existingOrder));
        }

        var user = await _userManager.FindByEmailAsync(customerEmail)
            ?? await _userManager.FindByNameAsync(customerEmail);

        if (user is null)
        {
            return BadRequest("Customer user not found.");
        }

        var normalizedItems = request.Items
            .Select(item => new { ProductId = item.ProductId, Quantity = item.Quantity })
            .Where(item => item.ProductId > 0 && item.Quantity > 0)
            .ToList();

        if (normalizedItems.Count == 0)
        {
            return BadRequest("Checkout items are invalid.");
        }

        var productIds = normalizedItems.Select(item => item.ProductId).Distinct().ToList();
        var products = await _dbContext.Products
            .Where(product => productIds.Contains(product.Id))
            .ToListAsync();

        if (products.Count != productIds.Count)
        {
            return BadRequest("One or more products were not found.");
        }

        foreach (var item in normalizedItems)
        {
            var product = products.First(productItem => productItem.Id == item.ProductId);
            if (item.Quantity > product.InventoryCount)
            {
                return BadRequest($"Insufficient stock for {product.Name}.");
            }
        }

        var order = new Order
        {
            UserId = user.Id,
            StripeSessionId = stripeSessionId,
            CreatedAtUtc = DateTime.UtcNow
        };

        foreach (var item in normalizedItems)
        {
            var product = products.First(productItem => productItem.Id == item.ProductId);
            product.InventoryCount -= item.Quantity;

            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductNameSnapshot = product.Name,
                UnitPriceSnapshot = product.Price,
                Quantity = item.Quantity
            });
        }

        order.TotalAmount = order.Items.Sum(item => item.UnitPriceSnapshot * item.Quantity);

        _dbContext.Orders.Add(order);
        await _dbContext.SaveChangesAsync();

        await _dbContext.Entry(order).Reference(currentOrder => currentOrder.User).LoadAsync();
        await _dbContext.Entry(order).Collection(currentOrder => currentOrder.Items).LoadAsync();

        return Ok(MapOrder(order));
    }

    private static OrderResponseDto MapOrder(Order order)
    {
        return new OrderResponseDto
        {
            Id = order.Id,
            UserId = order.UserId,
            UserEmail = order.User?.Email ?? string.Empty,
            StripeSessionId = order.StripeSessionId,
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