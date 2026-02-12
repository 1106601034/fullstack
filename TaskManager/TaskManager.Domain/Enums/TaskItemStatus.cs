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
