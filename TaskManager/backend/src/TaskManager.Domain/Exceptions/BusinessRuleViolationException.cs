namespace TaskManager.Domain.Exceptions;

/// <summary>
/// Exception thrown when a business rule is violated.
/// </summary>
public class BusinessRuleViotionException : DomainException
{
    public string RuleName { get; }

    public BusinessRuleViotionException(string rulename, string message)
        : base(message)
    {
        RuleName = rulename;
    }
}
