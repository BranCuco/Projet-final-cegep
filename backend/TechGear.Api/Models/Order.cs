namespace TechGear.Api.Models;

public class Order
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public decimal TotalAmount { get; set; }

    public ApplicationUser? User { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}