using Microsoft.AspNetCore.Identity;

namespace TechGear.Api.Models;

public class ApplicationUser : IdentityUser
{
	public string FirstName { get; set; } = string.Empty;
	public string LastName { get; set; } = string.Empty;
	public string ShippingAddressLine1 { get; set; } = string.Empty;
	public string ShippingAddressLine2 { get; set; } = string.Empty;
	public string ShippingCity { get; set; } = string.Empty;
	public string ShippingState { get; set; } = string.Empty;
	public string ShippingPostalCode { get; set; } = string.Empty;
	public string ShippingCountry { get; set; } = string.Empty;

	public ICollection<ShippingAddress> ShippingAddresses { get; set; } = new List<ShippingAddress>();
}