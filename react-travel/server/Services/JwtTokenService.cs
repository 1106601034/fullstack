using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Travel.Api.Models;

namespace Travel.Api.Services;

public class JwtSettings
{
  public string Issuer { get; set; } = string.Empty;
  public string Audience { get; set; } = string.Empty;
  public string Key { get; set; } = string.Empty;
}

public class JwtTokenService
{
  private readonly JwtSettings _settings;

  public JwtTokenService(IOptions<JwtSettings> options)
  {
    _settings = options.Value;
  }

  public string GenerateToken(TravelUser user)
  {
    var claims = new List<Claim>
    {
      new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
      new(JwtRegisteredClaimNames.Email, user.Email),
      new(JwtRegisteredClaimNames.UniqueName, user.Email)
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
    var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
      _settings.Issuer,
      _settings.Audience,
      claims,
      expires: DateTime.UtcNow.AddDays(7),
      signingCredentials: credentials);

    return new JwtSecurityTokenHandler().WriteToken(token);
  }
}
