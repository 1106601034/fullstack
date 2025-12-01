using Microsoft.EntityFrameworkCore;
using Travel.Api.Models;

namespace Travel.Api.Data;

public class TravelContext : DbContext
{
  public TravelContext(DbContextOptions<TravelContext> options) : base(options)
  {
  }

  public DbSet<TouristRoute> TouristRoutes => Set<TouristRoute>();
  public DbSet<TouristRoutePicture> TouristRoutePictures => Set<TouristRoutePicture>();
  public DbSet<ProductCollection> ProductCollections => Set<ProductCollection>();
  public DbSet<TravelUser> Users => Set<TravelUser>();
  public DbSet<ShoppingCart> ShoppingCarts => Set<ShoppingCart>();
  public DbSet<ShoppingCartItem> ShoppingCartItems => Set<ShoppingCartItem>();
  public DbSet<Order> Orders => Set<Order>();
  public DbSet<OrderItem> OrderItems => Set<OrderItem>();

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<TouristRoute>()
      .Property(t => t.OriginalPrice)
      .HasColumnType("decimal(18,2)");

    modelBuilder.Entity<TouristRoute>()
      .Property(t => t.Price)
      .HasColumnType("decimal(18,2)");

    modelBuilder.Entity<ShoppingCartItem>()
      .Property(i => i.OriginalPrice)
      .HasColumnType("decimal(18,2)");

    modelBuilder.Entity<OrderItem>()
      .Property(i => i.OriginalPrice)
      .HasColumnType("decimal(18,2)");

    modelBuilder.Entity<ProductCollection>()
      .HasMany(pc => pc.TouristRoutes)
      .WithMany(t => t.ProductCollections)
      .UsingEntity(j => j.ToTable("ProductCollectionTouristRoutes"));

    modelBuilder.Entity<ShoppingCart>()
      .HasMany(c => c.ShoppingCartItems)
      .WithOne(i => i.ShoppingCart)
      .HasForeignKey(i => i.ShoppingCartId);

    modelBuilder.Entity<ShoppingCart>()
      .HasOne(c => c.User)
      .WithOne(u => u.ShoppingCart)
      .HasForeignKey<ShoppingCart>(c => c.UserId);

    modelBuilder.Entity<Order>()
      .HasMany(o => o.OrderItems)
      .WithOne(i => i.Order)
      .HasForeignKey(i => i.OrderId);

    modelBuilder.Entity<Order>()
      .HasOne(o => o.User)
      .WithMany(u => u.Orders)
      .HasForeignKey(o => o.UserId);
  }
}
