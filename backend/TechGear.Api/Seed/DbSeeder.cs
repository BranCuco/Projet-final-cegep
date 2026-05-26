using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TechGear.Api.Data;
using TechGear.Api.Models;

namespace TechGear.Api.Seed;

public static class DbSeeder
{
    private const string AdminRole = "Admin";
    private const string UserRole = "User";

    public static async Task SeedAdminAsync(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        if (!await roleManager.RoleExistsAsync(AdminRole))
        {
            await roleManager.CreateAsync(new IdentityRole(AdminRole));
        }

        if (!await roleManager.RoleExistsAsync(UserRole))
        {
            await roleManager.CreateAsync(new IdentityRole(UserRole));
        }

        var adminEmail = "admin";
        var adminUser = await userManager.FindByNameAsync(adminEmail);

        if (adminUser is null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = "admin@techgear.local",
                EmailConfirmed = true,
                FirstName = "Tech",
                LastName = "Gear Admin",
                PhoneNumber = "4185550100",
                ShippingAddressLine1 = "500 Rue Principale",
                ShippingAddressLine2 = "Bureau 100",
                ShippingCity = "Jonquiere",
                ShippingState = "QC",
                ShippingPostalCode = "G7S 0A1",
                ShippingCountry = "Canada"
            };

            var result = await userManager.CreateAsync(adminUser, "Admin123!");
            if (!result.Succeeded)
            {
                throw new InvalidOperationException("Unable to create admin user.");
            }
        }

        if (!await userManager.IsInRoleAsync(adminUser, AdminRole))
        {
            await userManager.AddToRoleAsync(adminUser, AdminRole);
        }

        await SeedCustomerAsync(userManager);

        await SeedAddressesAsync(serviceProvider, adminUser);

        var customer = await userManager.FindByEmailAsync("maria.lopez@techgear.local");
        if (customer is not null)
        {
            await SeedAddressesAsync(serviceProvider, customer);
        }

        await SeedProductsAsync(serviceProvider);
    }

    private static async Task SeedCustomerAsync(UserManager<ApplicationUser> userManager)
    {
        var customerEmail = "maria.lopez@techgear.local";
        var customer = await userManager.FindByEmailAsync(customerEmail);

        if (customer is null)
        {
            customer = new ApplicationUser
            {
                UserName = customerEmail,
                Email = customerEmail,
                EmailConfirmed = true,
                FirstName = "Maria",
                LastName = "Lopez",
                PhoneNumber = "4185550144",
                ShippingAddressLine1 = "123 Avenue du Campus",
                ShippingAddressLine2 = "Appartement 4",
                ShippingCity = "Jonquiere",
                ShippingState = "QC",
                ShippingPostalCode = "G7S 0B2",
                ShippingCountry = "Canada"
            };

            var createResult = await userManager.CreateAsync(customer, "User123!");
            if (!createResult.Succeeded)
            {
                throw new InvalidOperationException("Unable to create sample customer user.");
            }
        }

        if (!await userManager.IsInRoleAsync(customer, UserRole))
        {
            await userManager.AddToRoleAsync(customer, UserRole);
        }
    }

    private static async Task SeedAddressesAsync(IServiceProvider serviceProvider, ApplicationUser user)
    {
        var dbContext = serviceProvider.GetRequiredService<ApplicationDbContext>();
        var hasAddress = await dbContext.ShippingAddresses.AnyAsync(address => address.UserId == user.Id);

        if (hasAddress)
        {
            return;
        }

        dbContext.ShippingAddresses.AddRange(
            new ShippingAddress
            {
                UserId = user.Id,
                Label = "Maison",
                RecipientName = string.Join(' ', new[] { user.FirstName, user.LastName }.Where(item => !string.IsNullOrWhiteSpace(item))).Trim(),
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                AddressLine1 = string.IsNullOrWhiteSpace(user.ShippingAddressLine1) ? "1 Rue Principale" : user.ShippingAddressLine1,
                AddressLine2 = user.ShippingAddressLine2,
                City = string.IsNullOrWhiteSpace(user.ShippingCity) ? "Jonquiere" : user.ShippingCity,
                State = string.IsNullOrWhiteSpace(user.ShippingState) ? "QC" : user.ShippingState,
                PostalCode = string.IsNullOrWhiteSpace(user.ShippingPostalCode) ? "G7S 0A1" : user.ShippingPostalCode,
                Country = string.IsNullOrWhiteSpace(user.ShippingCountry) ? "Canada" : user.ShippingCountry,
                IsDefault = true
            },
            new ShippingAddress
            {
                UserId = user.Id,
                Label = "Travail",
                RecipientName = string.Join(' ', new[] { user.FirstName, user.LastName }.Where(item => !string.IsNullOrWhiteSpace(item))).Trim(),
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                AddressLine1 = "250 Boulevard Industriel",
                AddressLine2 = "Suite 3",
                City = "Chicoutimi",
                State = "QC",
                PostalCode = "G7H 4A2",
                Country = "Canada",
                IsDefault = false
            }
        );

        await dbContext.SaveChangesAsync();
    }

    private static async Task SeedProductsAsync(IServiceProvider serviceProvider)
    {
        var dbContext = serviceProvider.GetRequiredService<ApplicationDbContext>();

        if (await dbContext.Products.AnyAsync())
        {
            return;
        }

        dbContext.Products.AddRange(
            new Product
            {
                Name = "MacBook Pro 14",
                Description = "Ordinateur portable puissant pour travail créatif et développement.",
                ImageUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
                Price = 2199.99m,
                InventoryCount = 8
            },
            new Product
            {
                Name = "Samsung Galaxy S24",
                Description = "Smartphone haut de gamme avec appareil photo avancé et écran AMOLED.",
                ImageUrl = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
                Price = 1199.99m,
                InventoryCount = 15
            },
            new Product
            {
                Name = "Sony WH-1000XM5",
                Description = "Casque antibruit premium avec autonomie prolongée.",
                ImageUrl = "https://images.unsplash.com/photo-1518441902117-f0e2f4d98e3d?auto=format&fit=crop&w=1200&q=80",
                Price = 449.99m,
                InventoryCount = 20
            },
            new Product
            {
                Name = "Logitech MX Master 3S",
                Description = "Souris sans fil ergonomique pour productivité avancée.",
                ImageUrl = "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1200&q=80",
                Price = 129.99m,
                InventoryCount = 25
            },
            new Product
            {
                Name = "iPad Air",
                Description = "Tablette légère idéale pour étudier, créer et consommer du contenu.",
                ImageUrl = "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=80",
                Price = 899.99m,
                InventoryCount = 10
            },
            new Product
            {
                Name = "Nintendo Switch OLED",
                Description = "Console hybride avec écran OLED pour jouer à la maison ou en déplacement.",
                ImageUrl = "https://images.unsplash.com/photo-1578303512597-81e6cc155b3c?auto=format&fit=crop&w=1200&q=80",
                Price = 449.99m,
                InventoryCount = 12
            },
            new Product
            {
                Name = "Kindle Paperwhite",
                Description = "Liseuse compacte avec écran anti-reflet et autonomie longue durée.",
                ImageUrl = "https://images.unsplash.com/photo-1470549638415-0a0755be062a?auto=format&fit=crop&w=1200&q=80",
                Price = 179.99m,
                InventoryCount = 30
            },
            new Product
            {
                Name = "Dell UltraSharp 27",
                Description = "Moniteur 4K précis pour bureau, design et multitâche.",
                ImageUrl = "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&w=1200&q=80",
                Price = 549.99m,
                InventoryCount = 9
            }
        );

        await dbContext.SaveChangesAsync();
    }
}