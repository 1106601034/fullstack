namespace Travel.Api.Middleware;

public class ApiKeyMiddleware
{
  private readonly RequestDelegate _next;
  private readonly HashSet<string> _apiKeys;

  public ApiKeyMiddleware(RequestDelegate next, IConfiguration configuration)
  {
    _next = next;
    var configured = configuration["ApiKey"] ?? string.Empty;
    var secondary = configuration["ApiKeySecondary"];
    var keys = configured
      .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
      .ToList();

    if (!string.IsNullOrWhiteSpace(secondary))
    {
      keys.Add(secondary.Trim());
    }

    // Allow the axios default from the frontend as a fallback.
    keys.Add("F5F433A587BDBCC7");

    _apiKeys = keys
      .Where(k => !string.IsNullOrWhiteSpace(k))
      .ToHashSet(StringComparer.OrdinalIgnoreCase);
  }

  public async Task InvokeAsync(HttpContext context)
  {
    if (context.Request.Path.StartsWithSegments("/swagger"))
    {
      await _next(context);
      return;
    }

    if (!context.Request.Headers.TryGetValue("x-icode", out var supplied) ||
        !_apiKeys.Contains(supplied.FirstOrDefault() ?? string.Empty))
    {
      context.Response.StatusCode = StatusCodes.Status401Unauthorized;
      await context.Response.WriteAsync("Missing or invalid x-icode header");
      return;
    }

    await _next(context);
  }
}
