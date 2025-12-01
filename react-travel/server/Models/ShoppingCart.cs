namespace Travel.Api.Models;

public class ShoppingCart
{
  public Guid Id { get; set; }

  public Guid UserId { get; set; }

  public TravelUser? User { get; set; }

  public ICollection<ShoppingCartItem> ShoppingCartItems { get; set; } = new List<ShoppingCartItem>();
}
