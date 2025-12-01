namespace Travel.Api.Models;

public class OrderItem
{
  public int Id { get; set; }

  public Guid TouristRouteId { get; set; }

  public TouristRoute TouristRoute { get; set; } = null!;

  public decimal OriginalPrice { get; set; }

  public double DiscountPresent { get; set; }

  public Guid OrderId { get; set; }

  public Order Order { get; set; } = null!;
}
