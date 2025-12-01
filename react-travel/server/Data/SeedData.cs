using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Travel.Api.Models;

namespace Travel.Api.Data;

public static class SeedData
{
  public static async Task InitializeAsync(TravelContext context, ILogger logger, bool useInMemory)
  {
    if (!useInMemory)
    {
      try
      {
        var pending = await context.Database.GetPendingMigrationsAsync();
        if (pending.Any())
        {
          await context.Database.MigrateAsync();
        }
        else
        {
          await context.Database.EnsureCreatedAsync();
        }
      }
      catch (Exception ex)
      {
        logger.LogWarning(ex, "Database migration failed, attempting EnsureCreated instead.");
        await context.Database.EnsureCreatedAsync();
      }
    }
    else
    {
      await context.Database.EnsureCreatedAsync();
    }

    if (!context.TouristRoutes.Any())
    {
      var routes = CreateRoutes();
      await context.TouristRoutes.AddRangeAsync(routes);
      await context.SaveChangesAsync();
    }

    if (!context.ProductCollections.Any())
    {
      var allRoutes = await context.TouristRoutes.Include(t => t.TouristRoutePictures).ToListAsync();
      var hotRoutes = allRoutes.Take(9).ToList();
      var newRoutes = allRoutes.Skip(3).Take(9).ToList();
      var domesticRoutes = allRoutes.Skip(6).Concat(allRoutes.Take(3)).Take(9).ToList();
      var hot = new ProductCollection
      {
        Id = Guid.NewGuid(),
        Title = "热卖推荐",
        Description = "首页热卖路线",
        TouristRoutes = hotRoutes
      };

      var newArrivals = new ProductCollection
      {
        Id = Guid.NewGuid(),
        Title = "新品上市",
        Description = "本季上新",
        TouristRoutes = newRoutes
      };

      var domestic = new ProductCollection
      {
        Id = Guid.NewGuid(),
        Title = "国内游推荐",
        Description = "人气国内路线",
        TouristRoutes = domesticRoutes
      };

      await context.ProductCollections.AddRangeAsync(hot, newArrivals, domestic);
      await context.SaveChangesAsync();
    }

    if (!context.Users.Any())
    {
      var user = new TravelUser
      {
        Id = Guid.NewGuid(),
        Email = "demo@travel.com"
      };

      var hasher = new PasswordHasher<TravelUser>();
      user.PasswordHash = hasher.HashPassword(user, "Pass123$");

      var cart = new ShoppingCart
      {
        Id = Guid.NewGuid(),
        UserId = user.Id,
        User = user
      };

      var seededRoutes = await context.TouristRoutes.Take(3).ToListAsync();
      var cartItems = seededRoutes.Select(r => new ShoppingCartItem
      {
        TouristRouteId = r.Id,
        TouristRoute = r,
        OriginalPrice = r.OriginalPrice,
        DiscountPresent = r.DiscountPresent ?? 1,
        ShoppingCartId = cart.Id,
        ShoppingCart = cart
      }).ToList();

      cart.ShoppingCartItems = cartItems;
      user.ShoppingCart = cart;

      await context.Users.AddAsync(user);
      await context.SaveChangesAsync();
    }

    if (!context.Orders.Any())
    {
      var user = await context.Users.Include(u => u.Orders).FirstAsync();
      var route = await context.TouristRoutes.Skip(2).FirstAsync();
      var order = new Order
      {
        Id = Guid.NewGuid(),
        UserId = user.Id,
        CreatedAt = DateTime.UtcNow.AddDays(-2),
        State = "Completed"
      };

      order.OrderItems.Add(new OrderItem
      {
        TouristRouteId = route.Id,
        TouristRoute = route,
        OriginalPrice = route.OriginalPrice,
        DiscountPresent = route.DiscountPresent ?? 1,
        OrderId = order.Id,
        Order = order
      });

      await context.Orders.AddAsync(order);
      await context.SaveChangesAsync();
    }
  }

  private static List<TouristRoute> CreateRoutes()
  {
    var pictureId = 1;
    TouristRoute Build(
      string title,
      string description,
      decimal originalPrice,
      double discount,
      double rating,
      string travelDays,
      string tripType,
      string departureCity,
      string imageUrl)
    {
      var route = new TouristRoute
      {
        Id = Guid.NewGuid(),
        Title = title,
        Description = description,
        OriginalPrice = originalPrice,
        DiscountPresent = discount <= 0 ? null : discount,
        Price = discount > 0 ? originalPrice * (decimal)discount : originalPrice,
        Rating = rating,
        TravelDays = travelDays,
        TripType = tripType,
        DepartureCity = departureCity,
        Features = "<p>精选行程，包含当地经典景点与特色体验。</p>",
        Fees = "<ul><li>往返机票</li><li>当地酒店</li><li>导游服务</li></ul>",
        Notes = "<p>下单后客服会电话确认，请保持手机畅通。</p>"
      };

      route.TouristRoutePictures.Add(new TouristRoutePicture
      {
        Id = pictureId++,
        TouristRouteId = route.Id,
        Url = imageUrl
      });

      return route;
    }

    return new List<TouristRoute>
    {
      Build("巴黎浪漫之旅", "埃菲尔铁塔与塞纳河全景体验", 8999m, 0.8, 4.9, "7", "跟团游", "上海", "https://images.unsplash.com/photo-1502602898657-3e91760cbb34"),
      Build("京都樱花漫步", "赏樱、清水寺与祇园美食", 6599m, 0.85, 4.8, "6", "半自助", "北京", "https://images.unsplash.com/photo-1545569341-9eb8b30979d5"),
      Build("马尔代夫海岛度假", "蜜月首选，水屋与浮潜", 12999m, 0.75, 4.9, "5", "自由行", "广州", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"),
      Build("云南少数民族风情", "大理丽江深度游，洱海骑行", 4999m, 0.9, 4.7, "8", "跟团游", "成都", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e"),
      Build("新疆丝绸之路探险", "喀纳斯、伊犁草原与沙漠星空", 7599m, 0.92, 4.8, "9", "跟团游", "西安", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"),
      Build("川藏线自驾", "318 国道自驾，雪山与草甸", 6899m, 0.88, 4.6, "10", "自驾", "重庆", "https://images.unsplash.com/photo-1470770841072-f978cf4d019e"),
      Build("冰岛极光之旅", "蓝湖温泉、冰川徒步与极光追逐", 14999m, 0.78, 4.9, "7", "半自助", "上海", "https://images.unsplash.com/photo-1469474968028-56623f02e42e"),
      Build("巴厘岛亲子假期", "家庭度假村与海滩时光", 5999m, 0.95, 4.5, "6", "自由行", "深圳", "https://images.unsplash.com/photo-1505761671935-60b3a7427bad"),
      Build("纽约城市探索", "大都会、中央公园与百老汇", 9999m, 0.8, 4.7, "7", "跟团游", "上海", "https://images.unsplash.com/photo-1469474968028-56623f02e42e"),
      Build("伦敦文化漫游", "双层巴士、泰晤士河夜游", 9799m, 0.82, 4.6, "7", "半自助", "北京", "https://images.unsplash.com/photo-1469474968028-56623f02e42e"),
      Build("黄山云海日出", "黄山徒步与宏村古镇", 3599m, 1, 4.5, "4", "跟团游", "南京", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"),
      Build("新西兰南岛环线", "皇后镇、蒂卡普星空与峡湾", 13999m, 0.8, 4.9, "9", "自驾", "上海", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee")
    };
  }
}
