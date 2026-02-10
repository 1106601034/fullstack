namespace TaskManager.Domain.Enums;

/// <summary>
/// Respresents the possible states of a task.
/// </summary>
public enum TaskItemStatus
{
    Todo = 0,
    InProgress = 1,
    Done = 2,
    Cancelled = 3,
}

/// <summary>
/// Represents task priority levels.
/// </summary>
public enum TaskPriority
{
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3,
}
