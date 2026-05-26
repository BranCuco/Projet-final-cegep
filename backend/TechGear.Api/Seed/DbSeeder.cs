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

        var productsToSeed = new List<Product>
        {
            new Product
            {
                Name = "Intel Core i9-14900K",
                Description = "Processeur hautes performances 24 coeurs/32 threads pour gaming et creation.",
                ImageUrl = "https://images.unsplash.com/photo-1591799265444-d66432b91588?auto=format&fit=crop&w=1200&q=80",
                Price = 829.99m,
                InventoryCount = 12
            },
            new Product
            {
                Name = "AMD Ryzen 7 7800X3D",
                Description = "CPU optimisee pour le jeu avec 3D V-Cache et excellente efficacite energetique.",
                ImageUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
                Price = 529.99m,
                InventoryCount = 18
            },
            new Product
            {
                Name = "NVIDIA GeForce RTX 4080 SUPER 16GB",
                Description = "Carte graphique premium pour 1440p/4K avec ray tracing et DLSS.",
                ImageUrl = "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80",
                Price = 1499.99m,
                InventoryCount = 7
            },
            new Product
            {
                Name = "AMD Radeon RX 7900 XTX 24GB",
                Description = "GPU haut de gamme pour performances 4K et creation de contenu.",
                ImageUrl = "https://images.unsplash.com/photo-1587202372775-e229f172d8b2?auto=format&fit=crop&w=1200&q=80",
                Price = 1399.99m,
                InventoryCount = 6
            },
            new Product
            {
                Name = "Corsair Vengeance DDR5 32GB (2x16) 6000MHz",
                Description = "Kit memoire DDR5 rapide et stable pour plateformes Intel et AMD.",
                ImageUrl = "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=1200&q=80",
                Price = 199.99m,
                InventoryCount = 35
            },
            new Product
            {
                Name = "G.SKILL Trident Z5 RGB DDR5 64GB (2x32) 6400MHz",
                Description = "Memoire DDR5 capacite elevee pour stations de travail et multitache lourde.",
                ImageUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
                Price = 379.99m,
                InventoryCount = 16
            },
            new Product
            {
                Name = "Samsung 990 PRO NVMe SSD 2TB",
                Description = "SSD NVMe PCIe 4.0 ultra rapide pour jeux et chargements instantanes.",
                ImageUrl = "https://images.unsplash.com/photo-1580894908361-967195033215?auto=format&fit=crop&w=1200&q=80",
                Price = 289.99m,
                InventoryCount = 22
            },
            new Product
            {
                Name = "Kingston KC3000 NVMe SSD 1TB",
                Description = "Stockage M.2 performant et fiable pour systeme et applications.",
                ImageUrl = "https://images.unsplash.com/photo-1591799265444-d66432b91588?auto=format&fit=crop&w=1200&q=80",
                Price = 149.99m,
                InventoryCount = 28
            },
            new Product
            {
                Name = "ASUS ROG Strix B650E-F Gaming WiFi",
                Description = "Carte mere AM5 avec WiFi 6E, PCIe 5.0 et VRM solide.",
                ImageUrl = "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80",
                Price = 359.99m,
                InventoryCount = 14
            },
            new Product
            {
                Name = "MSI MAG Z790 Tomahawk WiFi",
                Description = "Carte mere Intel Z790 avec excellente connectique et stabilite.",
                ImageUrl = "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80",
                Price = 399.99m,
                InventoryCount = 11
            },
            new Product
            {
                Name = "Corsair RM850x 850W 80+ Gold",
                Description = "Alimentation modulaire silencieuse et fiable pour PC gaming.",
                ImageUrl = "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1200&q=80",
                Price = 179.99m,
                InventoryCount = 20
            },
            new Product
            {
                Name = "Noctua NH-D15 chromax.black",
                Description = "Refroidisseur air premium tres performant et discret.",
                ImageUrl = "https://images.unsplash.com/photo-1555617981-dac3880eac6e?auto=format&fit=crop&w=1200&q=80",
                Price = 129.99m,
                InventoryCount = 17
            },
            new Product
            {
                Name = "NZXT H7 Flow",
                Description = "Boitier ATX avec airflow optimise et montage facile.",
                ImageUrl = "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?auto=format&fit=crop&w=1200&q=80",
                Price = 169.99m,
                InventoryCount = 13
            }
        };

        var existingProductNames = await dbContext.Products
            .Select(product => product.Name)
            .ToListAsync();

        var productsToInsert = productsToSeed
            .Where(product => !existingProductNames.Contains(product.Name, StringComparer.OrdinalIgnoreCase))
            .ToList();

        if (productsToInsert.Count == 0)
        {
            return;
        }

        dbContext.Products.AddRange(productsToInsert);

        await dbContext.SaveChangesAsync();
    }
}