using System.ComponentModel.DataAnnotations;

namespace Travel.Api.Models;

public class TouristRoute
{
  public Guid Id { get; set; }

  [Required]
  public string Title { get; set; } = string.Empty;

  public string Description { get; set; } = string.Empty;

  public decimal OriginalPrice { get; set; }

  public double? DiscountPresent { get; set; }

  public decimal Price { get; set; }

  public double Rating { get; set; }

  public string? TravelDays { get; set; }

  public string? TripType { get; set; }

  public string? DepartureCity { get; set; }

  public string? Features { get; set; }

  public string? Fees { get; set; }

  public string? Notes { get; set; }

  public ICollection<TouristRoutePicture> TouristRoutePictures { get; set; } = new List<TouristRoutePicture>();

  public ICollection<ProductCollection> ProductCollections { get; set; } = new List<ProductCollection>();
}
