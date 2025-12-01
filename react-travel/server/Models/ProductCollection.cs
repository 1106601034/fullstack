namespace Travel.Api.Models;

public class ProductCollection
{
  public Guid Id { get; set; }

  public string Title { get; set; } = string.Empty;

  public string? Description { get; set; }

  public ICollection<TouristRoute> TouristRoutes { get; set; } = new List<TouristRoute>();
}
