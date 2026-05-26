namespace TechGear.Api.Dtos.Orders;

public class CreateCheckoutOrderRequestDto
{
    public string StripeSessionId { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public IList<CheckoutOrderItemDto> Items { get; set; } = new List<CheckoutOrderItemDto>();
}
