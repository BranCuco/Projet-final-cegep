using TechGear.Api.Models;

namespace TechGear.Api.Services;

public interface IJwtTokenService
{
    string CreateToken(ApplicationUser user, IList<string> roles);
}