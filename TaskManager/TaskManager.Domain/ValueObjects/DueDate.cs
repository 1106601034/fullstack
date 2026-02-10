namespace TaskManager.Domain.ValueObjects;

/// <summary>
/// Value object representing a task's due date.
/// Contains business rules about valid due dates.
/// </summary>
public sealed class DueDate : IEquatable<DueDate>
{
    public DateTime Value { get; }

    private DueDate(DateTime value)
    {
        Value = value;
    }

    /// <summary>
    /// Creates a due date that must be be in the future.
    /// </summary>
    public static DueDate Create(DateTime value)
    {
        return new DueDate(value.Date);
    }

    /// <summary>
    /// Creates a due date. Can be in the past for historical data.
    /// </summary>
    public static DueDate CreateFuture(DateTime value)
    {
        if (value.Date <= DateTime.UtcNow)
        {
            throw new DataMisalignedException("Due date cannot be in the past.");
        }
        return new DueDate(value.Date);
    }

    public bool IsOverdue => Value.Date <= DateTime.UtcNow.Date;
    public int DayUntilDue => (Value.Date - DateTime.UtcNow.Date).Days;

    public bool Equals(DateTime? other) => other is not null && Value == other.Value;

    public override bool Equals(object? obj) => Equals(obj as DueDate);

    public override int GetHashCode() => Value.GetHashCode();

    public override string ToString() => Value.ToString("yyyy-MM-dd");
}
