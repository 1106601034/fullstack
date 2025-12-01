namespace Travel.Api.Models;

public class ShoppingCartItem
{
  public int Id { get; set; }

  public Guid TouristRouteId { get; set; }

  public TouristRoute TouristRoute { get; set; } = null!;

  public Guid ShoppingCartId { get; set; }

  public ShoppingCart ShoppingCart { get; set; } = null!;

  public decimal OriginalPrice { get; set; }

  public double DiscountPresent { get; set; }
}
