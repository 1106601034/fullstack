using TaskManager.Domain.common;
using TaskManager.Domain.Interface;

namespace TaskManager.Domain.Events;

/// <summary>
/// Event raised whhen a new task is created.
/// </summary>
public sealed class TaskCreateEvent : IDomainEvent
{
    public Guid TaskId { get; }
    public string Title { get; }
    public DateTime OccurredOn { get; }
}
