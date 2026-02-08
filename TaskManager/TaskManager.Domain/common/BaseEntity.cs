namespace TaskManager.Domain.common;

/// <summary>
/// Base class for all domain entities.
/// Provides common functionality like identity and domain events.
/// </summary>
public abstract class BaseEntity
{
    public Guid Id { get; protected set; }
    public DateTime CreateDate { get; protected set; }
    public DateTime UpdatedAt { get; protected set; }
    public readonly List<IDomainEvent> _domainEvents = new();
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    protected BaseEntity()
    {
        Id = Guid.NewGuid();
        CreateDate = DateTime.UtcNow;
    }

    public void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public void RemoveDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Remove(domainEvent);
    }

    public void ClearDomainEvent()
    {
        _domainEvents.Clear();
    }

    public void SetUpdated()
    {
        UpdatedAt = DateTime.UtcNow;
    }
}
