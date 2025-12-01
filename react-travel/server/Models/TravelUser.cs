namespace Travel.Api.Models;

public class TravelUser
{
  public Guid Id { get; set; }

  public string Email { get; set; } = string.Empty;

  public string PasswordHash { get; set; } = string.Empty;

  public ShoppingCart? ShoppingCart { get; set; }

  public ICollection<Order> Orders { get; set; } = new List<Order>();
}
