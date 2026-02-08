namespace TaskManager.Domain.common;

/// <summary>
/// Marker interface for domain events.
/// Domain events represent something that happened in the domain.
/// </summary>
public interface IDomainEvent
{
    DateTime OccurredOn { get; }
}
