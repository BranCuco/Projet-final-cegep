namespace TechGear.Api.Dtos.Orders;

public class OrderResponseDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string StripeSessionId { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public decimal TotalAmount { get; set; }
    public IList<OrderItemResponseDto> Items { get; set; } = new List<OrderItemResponseDto>();
}