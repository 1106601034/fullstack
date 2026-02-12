using TaskManager.Domain.Exceptions;

namespace TaskManager.Domain.ValueObjects;

/// <summary>
/// Value object representing a taskk titile.
/// Encapsulates validation rules for task titles.
/// </summary>
public sealed class TaskTitle : IEquatable<TaskTitle>
{
    public string Value { get; }

    private TaskTitle(string value)
    {
        Value = value;
    }

    /// <summary>
    /// Creates a new TaskTitle with validation.
    /// </summary
    public static TaskTitle Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new DomainException("Task title cannot be empty");
        }
        if (value.Length > 200)
        {
            throw new DomainException("Task title cannot exceed 200 characters");
        }
        return new TaskTitle(value.Trim());
    }

    public bool Equals(TaskTitle? other) => other is not null && Value == other.Value;

    public override bool Equals(object? obj) => Equals(obj as TaskTitle);

    public override int GetHashCode() => Value.GetHashCode();

    public override string ToString() => Value;

    public static implicit operator string(TaskTitle title) => title.Value;
}
