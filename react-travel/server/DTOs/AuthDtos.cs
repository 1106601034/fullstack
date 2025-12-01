namespace Travel.Api.DTOs;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(string Email, string Password, string ConfirmPassword);

public record AuthResponse(string Token, string Email);
