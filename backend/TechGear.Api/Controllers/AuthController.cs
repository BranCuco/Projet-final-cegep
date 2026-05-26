using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TechGear.Api.Dtos.Auth;
using TechGear.Api.Models;
using TechGear.Api.Services;

namespace TechGear.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthController(UserManager<ApplicationUser> userManager, IJwtTokenService jwtTokenService)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterRequestDto request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null)
        {
            return BadRequest("Email already in use.");
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors.Select(e => e.Description));
        }

        await _userManager.AddToRoleAsync(user, "User");
        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtTokenService.CreateToken(user, roles);

        return Ok(new AuthResponseDto
        {
            Token = token,
            Email = user.Email ?? string.Empty,
            Roles = roles
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginRequestDto request)
    {
        ApplicationUser? user;

        if (request.Email == "admin")
        {
            user = await _userManager.FindByNameAsync("admin");
        }
        else
        {
            user = await _userManager.FindByEmailAsync(request.Email);
        }

        if (user is null)
        {
            return Unauthorized("Invalid credentials.");
        }

        var validPassword = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!validPassword)
        {
            return Unauthorized("Invalid credentials.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtTokenService.CreateToken(user, roles);

        return Ok(new AuthResponseDto
        {
            Token = token,
            Email = user.Email ?? string.Empty,
            Roles = roles
        });
    }
}