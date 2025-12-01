using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Travel.Api.Data;
using Travel.Api.DTOs;
using Travel.Api.Middleware;
using Travel.Api.Models;
using Travel.Api.Services;

var builder = WebApplication.CreateBuilder(args);

var useInMemory = builder.Configuration.GetValue<bool>("UseInMemoryDatabase");

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));
builder.Services.AddSingleton<JwtTokenService>();

builder.Services.AddDbContext<TravelContext>(options =>
{
  if (useInMemory)
  {
    options.UseInMemoryDatabase("travel");
  }
  else
  {
    var connectionString = builder.Configuration.GetConnectionString("Travel");
    options.UseNpgsql(connectionString);
  }
});

var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtSettings = jwtSection.Get<JwtSettings>() ?? new JwtSettings();

builder.Services
  .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddJwtBearer(options =>
  {
    options.TokenValidationParameters = new TokenValidationParameters
    {
      ValidateIssuer = true,
      ValidateAudience = true,
      ValidateLifetime = true,
      ValidateIssuerSigningKey = true,
      ValidIssuer = jwtSettings.Issuer,
      ValidAudience = jwtSettings.Audience,
      IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key))
    };
  });

builder.Services.AddAuthorization();

builder.Services.AddCors(policy =>
{
  policy.AddDefaultPolicy(p =>
  {
    p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
  });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddControllers().AddJsonOptions(options =>
{
  options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
  options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

builder.Services.ConfigureHttpJsonOptions(options =>
{
  options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
  options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
  app.UseSwagger();
  app.UseSwaggerUI();
}

app.UseMiddleware<ApiKeyMiddleware>();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

using (var scope = app.Services.CreateScope())
{
  var scopedServices = scope.ServiceProvider;
  var context = scopedServices.GetRequiredService<TravelContext>();
  var logger = scopedServices.GetRequiredService<ILoggerFactory>().CreateLogger("SeedData");
  await SeedData.InitializeAsync(context, logger, useInMemory);
}

app.MapGet("/", () => Results.Ok(new { message = "React Travel API ready" }));

var api = app.MapGroup("/api");

api.MapGet("/touristRoutes", async (
  string? keyword,
  int pageNumber,
  int pageSize,
  TravelContext context,
  HttpContext httpContext) =>
{
  pageNumber = pageNumber <= 0 ? 1 : pageNumber;
  pageSize = pageSize <= 0 ? 10 : pageSize;

  var query = context.TouristRoutes
    .Include(t => t.TouristRoutePictures)
    .AsQueryable();

  if (!string.IsNullOrWhiteSpace(keyword))
  {
    query = query.Where(t => t.Title.Contains(keyword) || t.Description.Contains(keyword));
  }

  var totalCount = await query.CountAsync();
  var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
  var items = await query
    .Skip((pageNumber - 1) * pageSize)
    .Take(pageSize)
    .ToListAsync();

  var pagination = new PaginationMetadata(pageNumber, pageSize, totalCount, totalPages);
  var paginationJson = JsonSerializer.Serialize(pagination);
  httpContext.Response.Headers.Append("X-Pagination", paginationJson);
  return Results.Ok(items);
});

api.MapGet("/touristRoutes/{id}", async (Guid id, TravelContext context) =>
{
  var route = await context.TouristRoutes
    .Include(t => t.TouristRoutePictures)
    .FirstOrDefaultAsync(t => t.Id == id);

  return route is null ? Results.NotFound() : Results.Ok(route);
});

api.MapGet("/productCollections", async (TravelContext context) =>
{
  var collections = await context.ProductCollections
    .Include(c => c.TouristRoutes)
      .ThenInclude(t => t.TouristRoutePictures)
    .ToListAsync();

  return Results.Ok(collections);
});

var shoppingCart = api.MapGroup("/shoppingCart").RequireAuthorization();

shoppingCart.MapGet("/", async (ClaimsPrincipal user, TravelContext context) =>
{
  var userId = GetUserId(user);
  if (userId == Guid.Empty)
  {
    return Results.Unauthorized();
  }

  var cart = await context.ShoppingCarts
    .Include(c => c.ShoppingCartItems)
      .ThenInclude(i => i.TouristRoute)
        .ThenInclude(t => t.TouristRoutePictures)
    .FirstOrDefaultAsync(c => c.UserId == userId);

  if (cart == null)
  {
    cart = new ShoppingCart
    {
      Id = Guid.NewGuid(),
      UserId = userId
    };
    await context.ShoppingCarts.AddAsync(cart);
    await context.SaveChangesAsync();
  }

  return Results.Ok(new { shoppingCartItems = cart.ShoppingCartItems });
});

shoppingCart.MapPost("/items", async (
  ClaimsPrincipal user,
  TravelContext context,
  AddCartItemRequest request) =>
{
  var userId = GetUserId(user);
  if (userId == Guid.Empty)
  {
    return Results.Unauthorized();
  }

  var route = await context.TouristRoutes
    .Include(t => t.TouristRoutePictures)
    .FirstOrDefaultAsync(t => t.Id == request.TouristRouteId);

  if (route is null)
  {
    return Results.NotFound("Tourist route not found");
  }

  var cart = await context.ShoppingCarts
    .Include(c => c.ShoppingCartItems)
      .ThenInclude(i => i.TouristRoute)
        .ThenInclude(t => t.TouristRoutePictures)
    .FirstOrDefaultAsync(c => c.UserId == userId);

  if (cart == null)
  {
    cart = new ShoppingCart
    {
      Id = Guid.NewGuid(),
      UserId = userId
    };
    await context.ShoppingCarts.AddAsync(cart);
  }

  var item = new ShoppingCartItem
  {
    TouristRouteId = route.Id,
    TouristRoute = route,
    OriginalPrice = route.OriginalPrice,
    DiscountPresent = route.DiscountPresent ?? 1,
    ShoppingCartId = cart.Id,
    ShoppingCart = cart
  };

  cart.ShoppingCartItems.Add(item);
  await context.SaveChangesAsync();

  return Results.Ok(new { shoppingCartItems = cart.ShoppingCartItems });
});

shoppingCart.MapDelete("/items/{ids}", async (string ids, ClaimsPrincipal user, TravelContext context) =>
{
  var userId = GetUserId(user);
  if (userId == Guid.Empty)
  {
    return Results.Unauthorized();
  }

  var cart = await context.ShoppingCarts
    .Include(c => c.ShoppingCartItems)
    .FirstOrDefaultAsync(c => c.UserId == userId);

  if (cart == null)
  {
    return Results.NotFound();
  }

  var cleaned = ids.Replace("(", string.Empty).Replace(")", string.Empty);
  var idList = cleaned
    .Split(',', StringSplitOptions.RemoveEmptyEntries)
    .Select(x => int.TryParse(x.Trim(), out var parsed) ? parsed : (int?)null)
    .Where(x => x.HasValue)
    .Select(x => x!.Value)
    .ToList();

  var itemsToRemove = cart.ShoppingCartItems
    .Where(i => idList.Contains(i.Id))
    .ToList();

  if (itemsToRemove.Any())
  {
    context.ShoppingCartItems.RemoveRange(itemsToRemove);
  }

  await context.SaveChangesAsync();
  return Results.NoContent();
});

shoppingCart.MapPost("/checkout", async (ClaimsPrincipal user, TravelContext context) =>
{
  var userId = GetUserId(user);
  if (userId == Guid.Empty)
  {
    return Results.Unauthorized();
  }

  var cart = await context.ShoppingCarts
    .Include(c => c.ShoppingCartItems)
      .ThenInclude(i => i.TouristRoute)
        .ThenInclude(t => t.TouristRoutePictures)
    .FirstOrDefaultAsync(c => c.UserId == userId);

  if (cart == null || !cart.ShoppingCartItems.Any())
  {
    return Results.BadRequest("Shopping cart is empty");
  }

  var order = new Order
  {
    Id = Guid.NewGuid(),
    UserId = userId,
    CreatedAt = DateTime.UtcNow,
    State = "Pending"
  };

  foreach (var cartItem in cart.ShoppingCartItems)
  {
    order.OrderItems.Add(new OrderItem
    {
      TouristRouteId = cartItem.TouristRouteId,
      TouristRoute = cartItem.TouristRoute,
      OriginalPrice = cartItem.OriginalPrice,
      DiscountPresent = cartItem.DiscountPresent,
      OrderId = order.Id,
      Order = order
    });
  }

  context.ShoppingCartItems.RemoveRange(cart.ShoppingCartItems);
  cart.ShoppingCartItems.Clear();
  await context.Orders.AddAsync(order);
  await context.SaveChangesAsync();

  return Results.Ok(order);
});

var orders = api.MapGroup("/orders").RequireAuthorization();

orders.MapGet("/", async (
  ClaimsPrincipal user,
  TravelContext context,
  int pageSize,
  int pageNumber,
  HttpContext httpContext) =>
{
  var userId = GetUserId(user);
  if (userId == Guid.Empty)
  {
    return Results.Unauthorized();
  }

  pageNumber = pageNumber <= 0 ? 1 : pageNumber;
  pageSize = pageSize <= 0 ? 5 : pageSize;

  var query = context.Orders
    .Include(o => o.OrderItems)
      .ThenInclude(i => i.TouristRoute)
        .ThenInclude(t => t.TouristRoutePictures)
    .Where(o => o.UserId == userId)
    .OrderByDescending(o => o.CreatedAt);

  var totalCount = await query.CountAsync();
  var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
  var ordersList = await query
    .Skip((pageNumber - 1) * pageSize)
    .Take(pageSize)
    .ToListAsync();

  var pagination = new PaginationMetadata(pageNumber, pageSize, totalCount, totalPages);
  var paginationJson = JsonSerializer.Serialize(pagination);
  httpContext.Response.Headers.Append("X-Pagination", paginationJson);
  return Results.Ok(ordersList);
});

orders.MapGet("/{orderId}", async (Guid orderId, ClaimsPrincipal user, TravelContext context) =>
{
  var userId = GetUserId(user);
  if (userId == Guid.Empty)
  {
    return Results.Unauthorized();
  }

  var order = await context.Orders
    .Include(o => o.OrderItems)
      .ThenInclude(i => i.TouristRoute)
        .ThenInclude(t => t.TouristRoutePictures)
    .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

  return order is null ? Results.NotFound() : Results.Ok(order);
});

orders.MapPost("/{orderId}/placeOrder", async (Guid orderId, ClaimsPrincipal user, TravelContext context) =>
{
  var userId = GetUserId(user);
  if (userId == Guid.Empty)
  {
    return Results.Unauthorized();
  }

  var order = await context.Orders
    .Include(o => o.OrderItems)
      .ThenInclude(i => i.TouristRoute)
        .ThenInclude(t => t.TouristRoutePictures)
    .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

  if (order is null)
  {
    return Results.NotFound();
  }

  order.State = "Completed";
  await context.SaveChangesAsync();
  return Results.Ok(order);
});

var auth = app.MapGroup("/auth");

auth.MapPost("/login", async (LoginRequest request, TravelContext context, JwtTokenService tokenService) =>
{
  var user = await context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
  if (user is null)
  {
    return Results.Unauthorized();
  }

  var hasher = new PasswordHasher<TravelUser>();
  var verification = hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
  if (verification == PasswordVerificationResult.Failed)
  {
    return Results.Unauthorized();
  }

  var token = tokenService.GenerateToken(user);
  return Results.Ok(new AuthResponse(token, user.Email));
});

auth.MapPost("/register", async (RegisterRequest request, TravelContext context, JwtTokenService tokenService) =>
{
  if (request.Password != request.ConfirmPassword)
  {
    return Results.BadRequest("Passwords do not match");
  }

  if (await context.Users.AnyAsync(u => u.Email == request.Email))
  {
    return Results.Conflict("User already exists");
  }

  var user = new TravelUser
  {
    Id = Guid.NewGuid(),
    Email = request.Email
  };

  var hasher = new PasswordHasher<TravelUser>();
  user.PasswordHash = hasher.HashPassword(user, request.Password);

  var cart = new ShoppingCart
  {
    Id = Guid.NewGuid(),
    UserId = user.Id,
    User = user
  };

  user.ShoppingCart = cart;

  await context.Users.AddAsync(user);
  await context.SaveChangesAsync();

  var token = tokenService.GenerateToken(user);
  return Results.Created($"/users/{user.Id}", new AuthResponse(token, user.Email));
});

app.Run();

static Guid GetUserId(ClaimsPrincipal user)
{
  var id = user.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? user.FindFirstValue(ClaimTypes.NameIdentifier);
  return Guid.TryParse(id, out var parsed) ? parsed : Guid.Empty;
}

record AddCartItemRequest(Guid TouristRouteId);
