namespace Travel.Api.Models;

public class Order
{
  public Guid Id { get; set; }

  public Guid UserId { get; set; }

  public TravelUser? User { get; set; }

  public DateTime CreatedAt { get; set; }

  public string State { get; set; } = "Pending";

  public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
