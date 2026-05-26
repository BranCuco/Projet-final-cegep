using Microsoft.AspNetCore.Identity;
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
                EmailConfirmed = true
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
    }
}