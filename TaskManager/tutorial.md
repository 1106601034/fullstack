# Clean Architecture with .NET 8: A Hands-On Tutorial

## Table of Contents

1. [Introduction](#introduction)
1. [What is Clean Architecture?](#what-is-clean-architecture)
1. [The Four Layers](#the-four-layers)
1. [Project Setup](#project-setup)
1. [Building the Domain Layer](#building-the-domain-layer)
1. [Building the Application Layer](#building-the-application-layer)
1. [Building the Infrastructure Layer](#building-the-infrastructure-layer)
1. [Building the Presentation Layer](#building-the-presentation-layer)
1. [Dependency Injection Configuration](#dependency-injection-configuration)
1. [Running the Application](#running-the-application)
1. [Testing Strategy](#testing-strategy)
1. [Best Practices and Common Pitfalls](#best-practices-and-common-pitfalls)
1. [Exercises](#exercises)
1. [Summary](#summary)

-----

## Introduction

Welcome to this hands-on tutorial on Clean Architecture using .NET 8! By the end of this tutorial, you will have built a complete Task Management API while understanding the core principles that make Clean Architecture so powerful for building maintainable, testable, and scalable applications.

### Prerequisites

Before starting, ensure you have the following installed:

- .NET 8 SDK
- Visual Studio 2022, VS Code, or JetBrains Rider
- Basic understanding of C# and ASP.NET Core
- Familiarity with Entity Framework Core (helpful but not required)

### What You’ll Build

We’ll create a **Task Management API** with the following features:

- Create, read, update, and delete tasks
- Assign tasks to users
- Mark tasks as complete
- Filter tasks by status and assignee

-----

## What is Clean Architecture?

Clean Architecture, introduced by Robert C. Martin (Uncle Bob), is a software design philosophy that separates concerns into distinct layers. The key principle is the **Dependency Rule**: source code dependencies can only point inward toward higher-level policies.

### Core Principles

**1. Independence from Frameworks**
The architecture doesn’t depend on any particular library or framework. Frameworks are tools, not constraints.

**2. Testability**
Business rules can be tested without UI, database, web server, or any external element.

**3. Independence from UI**
The UI can change easily without changing the rest of the system.

**4. Independence from Database**
You can swap PostgreSQL for MongoDB without affecting business rules.

**5. Independence from External Agencies**
Business rules don’t know anything about the outside world.

### The Dependency Rule Visualized

```
┌─────────────────────────────────────────────────────────────────┐
│                     Presentation Layer                          │
│                   (Controllers, ViewModels)                     │
├─────────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                         │
│            (Database, External Services, File System)           │
├─────────────────────────────────────────────────────────────────┤
│                     Application Layer                           │
│            (Use Cases, DTOs, Interfaces, Validators)            │
├─────────────────────────────────────────────────────────────────┤
│                       Domain Layer                              │
│              (Entities, Value Objects, Domain Events)           │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
            Dependencies point INWARD only
```

-----

## The Four Layers

### 1. Domain Layer (Innermost)

The heart of the application. Contains:

- **Entities**: Business objects with identity
- **Value Objects**: Immutable objects defined by their attributes
- **Domain Events**: Events that domain experts care about
- **Aggregates**: Clusters of entities treated as a unit
- **Repository Interfaces**: Abstractions for data access (no implementation)

### 2. Application Layer

Orchestrates the flow of data and coordinates domain objects. Contains:

- **Use Cases / Application Services**: Business logic orchestration
- **DTOs (Data Transfer Objects)**: Data structures for layer communication
- **Interfaces**: Contracts for external services
- **Validators**: Input validation logic
- **Mappers**: Transform between domain objects and DTOs

### 3. Infrastructure Layer

Implements interfaces defined in inner layers. Contains:

- **Database Context**: EF Core DbContext
- **Repository Implementations**: Concrete data access
- **External Service Integrations**: Email, SMS, third-party APIs
- **File System Access**: File operations
- **Caching Implementations**: Redis, Memory Cache

### 4. Presentation Layer (Outermost)

Entry point for users. Contains:

- **Controllers / Endpoints**: HTTP request handlers
- **Middleware**: Cross-cutting concerns
- **Filters**: Request/response processing
- **ViewModels**: UI-specific data structures

-----

## Project Setup

Let’s create our solution structure. Open your terminal and run the following commands:

### Step 1: Create the Solution

```bash
# Create solution directory
mkdir TaskManager
cd TaskManager

# Create solution file
dotnet new sln -n TaskManager

# Create projects for each layer
dotnet new classlib -n TaskManager.Domain -f net8.0
dotnet new classlib -n TaskManager.Application -f net8.0
dotnet new classlib -n TaskManager.Infrastructure -f net8.0
dotnet new webapi -n TaskManager.Api -f net8.0

# Add projects to solution
dotnet sln add TaskManager.Domain/TaskManager.Domain.csproj
dotnet sln add TaskManager.Application/TaskManager.Application.csproj
dotnet sln add TaskManager.Infrastructure/TaskManager.Infrastructure.csproj
dotnet sln add TaskManager.Api/TaskManager.Api.csproj
```

### Step 2: Configure Project References

The dependency rule dictates our references:

```bash
# Application references Domain
dotnet add TaskManager.Application/TaskManager.Application.csproj reference TaskManager.Domain/TaskManager.Domain.csproj

# Infrastructure references Application (and transitively Domain)
dotnet add TaskManager.Infrastructure/TaskManager.Infrastructure.csproj reference TaskManager.Application/TaskManager.Application.csproj

# Api references Infrastructure (and transitively all others)
dotnet add TaskManager.Api/TaskManager.Api.csproj reference TaskManager.Infrastructure/TaskManager.Infrastructure.csproj
```

### Step 3: Add Required NuGet Packages

```bash
# Domain Layer - minimal dependencies
dotnet add TaskManager.Domain package MediatR.Contracts --version 2.0.1

# Application Layer
dotnet add TaskManager.Application package MediatR --version 12.2.0
dotnet add TaskManager.Application package FluentValidation --version 11.9.0
dotnet add TaskManager.Application package FluentValidation.DependencyInjectionExtensions --version 11.9.0

# Infrastructure Layer
dotnet add TaskManager.Infrastructure package Microsoft.EntityFrameworkCore --version 8.0.1
dotnet add TaskManager.Infrastructure package Microsoft.EntityFrameworkCore.SqlServer --version 8.0.1
dotnet add TaskManager.Infrastructure package Microsoft.EntityFrameworkCore.InMemory --version 8.0.1

# Api Layer
dotnet add TaskManager.Api package Swashbuckle.AspNetCore --version 6.5.0
```

### Final Project Structure

```
TaskManager/
├── TaskManager.sln
├── TaskManager.Domain/
│   ├── Entities/
│   ├── ValueObjects/
│   ├── Events/
│   ├── Exceptions/
│   ├── Interfaces/
│   └── Enums/
├── TaskManager.Application/
│   ├── Common/
│   │   ├── Behaviors/
│   │   ├── Interfaces/
│   │   └── Mappings/
│   ├── Features/
│   │   └── Tasks/
│   │       ├── Commands/
│   │       └── Queries/
│   └── DTOs/
├── TaskManager.Infrastructure/
│   ├── Persistence/
│   │   ├── Configurations/
│   │   └── Repositories/
│   └── Services/
└── TaskManager.Api/
    ├── Controllers/
    ├── Middleware/
    └── Extensions/
```

-----

## Building the Domain Layer

The Domain layer is the core of our application. It should have **zero dependencies** on other layers.

### Step 1: Create the Base Entity

Create `TaskManager.Domain/Common/BaseEntity.cs`:

```csharp
namespace TaskManager.Domain.Common;

/// <summary>
/// Base class for all domain entities.
/// Provides common functionality like identity and domain events.
/// </summary>
public abstract class BaseEntity
{
    public Guid Id { get; protected set; }
    public DateTime CreatedAt { get; protected set; }
    public DateTime? UpdatedAt { get; protected set; }

    private readonly List<IDomainEvent> _domainEvents = new();
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    protected BaseEntity()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
    }

    public void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public void RemoveDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Remove(domainEvent);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }

    protected void SetUpdated()
    {
        UpdatedAt = DateTime.UtcNow;
    }
}

/// <summary>
/// Marker interface for domain events.
/// Domain events represent something that happened in the domain.
/// </summary>
public interface IDomainEvent
{
    DateTime OccurredOn { get; }
}
```

### Step 2: Create Enums

Create `TaskManager.Domain/Enums/TaskStatus.cs`:

```csharp
namespace TaskManager.Domain.Enums;

/// <summary>
/// Represents the possible states of a task.
/// </summary>
public enum TaskItemStatus
{
    Todo = 0,
    InProgress = 1,
    Done = 2,
    Cancelled = 3
}

/// <summary>
/// Represents task priority levels.
/// </summary>
public enum TaskPriority
{
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3
}
```

### Step 3: Create Value Objects

Value Objects are immutable and compared by their values, not identity.

Create `TaskManager.Domain/ValueObjects/TaskTitle.cs`:

```csharp
namespace TaskManager.Domain.ValueObjects;

/// <summary>
/// Value object representing a task title.
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
    /// </summary>
    public static TaskTitle Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new DomainException("Task title cannot be empty.");
        }

        if (value.Length > 200)
        {
            throw new DomainException("Task title cannot exceed 200 characters.");
        }

        return new TaskTitle(value.Trim());
    }

    public bool Equals(TaskTitle? other)
    {
        if (other is null) return false;
        return Value == other.Value;
    }

    public override bool Equals(object? obj) => Equals(obj as TaskTitle);

    public override int GetHashCode() => Value.GetHashCode();

    public override string ToString() => Value;

    public static implicit operator string(TaskTitle title) => title.Value;
}
```

Create `TaskManager.Domain/ValueObjects/DueDate.cs`:

```csharp
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
    /// Creates a due date. Can be in the past for historical data.
    /// </summary>
    public static DueDate Create(DateTime value)
    {
        return new DueDate(value.Date);
    }

    /// <summary>
    /// Creates a due date that must be in the future.
    /// </summary>
    public static DueDate CreateFuture(DateTime value)
    {
        if (value.Date < DateTime.UtcNow.Date)
        {
            throw new DomainException("Due date cannot be in the past.");
        }

        return new DueDate(value.Date);
    }

    public bool IsOverdue => Value.Date < DateTime.UtcNow.Date;

    public int DaysUntilDue => (Value.Date - DateTime.UtcNow.Date).Days;

    public bool Equals(DueDate? other)
    {
        if (other is null) return false;
        return Value == other.Value;
    }

    public override bool Equals(object? obj) => Equals(obj as DueDate);

    public override int GetHashCode() => Value.GetHashCode();

    public override string ToString() => Value.ToString("yyyy-MM-dd");
}
```

### Step 4: Create Domain Exceptions

Create `TaskManager.Domain/Exceptions/DomainException.cs`:

```csharp
namespace TaskManager.Domain.Exceptions;

/// <summary>
/// Base exception for domain rule violations.
/// </summary>
public class DomainException : Exception
{
    public DomainException(string message) : base(message)
    {
    }

    public DomainException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}

/// <summary>
/// Exception thrown when an entity is not found.
/// </summary>
public class EntityNotFoundException : DomainException
{
    public EntityNotFoundException(string entityName, object key)
        : base($"Entity '{entityName}' with key '{key}' was not found.")
    {
    }
}

/// <summary>
/// Exception thrown when a business rule is violated.
/// </summary>
public class BusinessRuleViolationException : DomainException
{
    public string RuleName { get; }

    public BusinessRuleViolationException(string ruleName, string message)
        : base(message)
    {
        RuleName = ruleName;
    }
}
```

### Step 5: Create Domain Events

Create `TaskManager.Domain/Events/TaskCreatedEvent.cs`:

```csharp
using TaskManager.Domain.Common;

namespace TaskManager.Domain.Events;

/// <summary>
/// Event raised when a new task is created.
/// </summary>
public sealed class TaskCreatedEvent : IDomainEvent
{
    public Guid TaskId { get; }
    public string Title { get; }
    public DateTime OccurredOn { get; }

    public TaskCreatedEvent(Guid taskId, string title)
    {
        TaskId = taskId;
        Title = title;
        OccurredOn = DateTime.UtcNow;
    }
}

/// <summary>
/// Event raised when a task is completed.
/// </summary>
public sealed class TaskCompletedEvent : IDomainEvent
{
    public Guid TaskId { get; }
    public Guid? CompletedByUserId { get; }
    public DateTime OccurredOn { get; }

    public TaskCompletedEvent(Guid taskId, Guid? completedByUserId)
    {
        TaskId = taskId;
        CompletedByUserId = completedByUserId;
        OccurredOn = DateTime.UtcNow;
    }
}

/// <summary>
/// Event raised when a task is assigned to a user.
/// </summary>
public sealed class TaskAssignedEvent : IDomainEvent
{
    public Guid TaskId { get; }
    public Guid AssignedToUserId { get; }
    public Guid? PreviousAssigneeId { get; }
    public DateTime OccurredOn { get; }

    public TaskAssignedEvent(Guid taskId, Guid assignedToUserId, Guid? previousAssigneeId)
    {
        TaskId = taskId;
        AssignedToUserId = assignedToUserId;
        PreviousAssigneeId = previousAssigneeId;
        OccurredOn = DateTime.UtcNow;
    }
}
```

### Step 6: Create the TaskItem Entity

This is our main aggregate root.

Create `TaskManager.Domain/Entities/TaskItem.cs`:

```csharp
using TaskManager.Domain.Common;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Events;
using TaskManager.Domain.Exceptions;
using TaskManager.Domain.ValueObjects;

namespace TaskManager.Domain.Entities;

/// <summary>
/// The TaskItem entity is an Aggregate Root.
/// All modifications to task-related data must go through this entity.
/// </summary>
public sealed class TaskItem : BaseEntity
{
    // Properties with private setters enforce encapsulation
    public TaskTitle Title { get; private set; } = null!;
    public string? Description { get; private set; }
    public TaskItemStatus Status { get; private set; }
    public TaskPriority Priority { get; private set; }
    public DueDate? DueDate { get; private set; }
    public Guid? AssignedToUserId { get; private set; }
    public DateTime? CompletedAt { get; private set; }

    // Private constructor for EF Core
    private TaskItem() { }

    /// <summary>
    /// Factory method to create a new task.
    /// Using factory methods ensures all business rules are enforced at creation.
    /// </summary>
    public static TaskItem Create(
        string title,
        string? description = null,
        TaskPriority priority = TaskPriority.Medium,
        DateTime? dueDate = null,
        Guid? assignedToUserId = null)
    {
        var task = new TaskItem
        {
            Title = TaskTitle.Create(title),
            Description = description,
            Status = TaskItemStatus.Todo,
            Priority = priority,
            DueDate = dueDate.HasValue ? ValueObjects.DueDate.CreateFuture(dueDate.Value) : null,
            AssignedToUserId = assignedToUserId
        };

        // Raise domain event
        task.AddDomainEvent(new TaskCreatedEvent(task.Id, title));

        return task;
    }

    /// <summary>
    /// Updates the task title.
    /// </summary>
    public void UpdateTitle(string newTitle)
    {
        Title = TaskTitle.Create(newTitle);
        SetUpdated();
    }

    /// <summary>
    /// Updates the task description.
    /// </summary>
    public void UpdateDescription(string? newDescription)
    {
        Description = newDescription;
        SetUpdated();
    }

    /// <summary>
    /// Sets the task priority.
    /// </summary>
    public void SetPriority(TaskPriority priority)
    {
        Priority = priority;
        SetUpdated();
    }

    /// <summary>
    /// Sets the due date for the task.
    /// </summary>
    public void SetDueDate(DateTime? dueDate)
    {
        DueDate = dueDate.HasValue ? ValueObjects.DueDate.Create(dueDate.Value) : null;
        SetUpdated();
    }

    /// <summary>
    /// Assigns the task to a user.
    /// </summary>
    public void AssignTo(Guid userId)
    {
        if (Status == TaskItemStatus.Done || Status == TaskItemStatus.Cancelled)
        {
            throw new BusinessRuleViolationException(
                "CannotAssignCompletedTask",
                "Cannot assign a completed or cancelled task.");
        }

        var previousAssignee = AssignedToUserId;
        AssignedToUserId = userId;
        SetUpdated();

        AddDomainEvent(new TaskAssignedEvent(Id, userId, previousAssignee));
    }

    /// <summary>
    /// Removes the assignment from the task.
    /// </summary>
    public void Unassign()
    {
        AssignedToUserId = null;
        SetUpdated();
    }

    /// <summary>
    /// Starts working on the task.
    /// </summary>
    public void StartProgress()
    {
        if (Status != TaskItemStatus.Todo)
        {
            throw new BusinessRuleViolationException(
                "InvalidStatusTransition",
                $"Cannot start a task that is in '{Status}' status.");
        }

        Status = TaskItemStatus.InProgress;
        SetUpdated();
    }

    /// <summary>
    /// Marks the task as complete.
    /// </summary>
    public void Complete()
    {
        if (Status == TaskItemStatus.Done)
        {
            throw new BusinessRuleViolationException(
                "TaskAlreadyCompleted",
                "Task is already completed.");
        }

        if (Status == TaskItemStatus.Cancelled)
        {
            throw new BusinessRuleViolationException(
                "CannotCompleteCancel",
                "Cannot complete a cancelled task.");
        }

        Status = TaskItemStatus.Done;
        CompletedAt = DateTime.UtcNow;
        SetUpdated();

        AddDomainEvent(new TaskCompletedEvent(Id, AssignedToUserId));
    }

    /// <summary>
    /// Cancels the task.
    /// </summary>
    public void Cancel()
    {
        if (Status == TaskItemStatus.Done)
        {
            throw new BusinessRuleViolationException(
                "CannotCancelCompleted",
                "Cannot cancel a completed task.");
        }

        Status = TaskItemStatus.Cancelled;
        SetUpdated();
    }

    /// <summary>
    /// Reopens a completed or cancelled task.
    /// </summary>
    public void Reopen()
    {
        Status = TaskItemStatus.Todo;
        CompletedAt = null;
        SetUpdated();
    }
}
```

### Step 7: Create Repository Interfaces

Create `TaskManager.Domain/Interfaces/ITaskRepository.cs`:

```csharp
using TaskManager.Domain.Entities;
using TaskManager.Domain.Enums;

namespace TaskManager.Domain.Interfaces;

/// <summary>
/// Repository interface for TaskItem aggregate.
/// Defined in Domain but implemented in Infrastructure.
/// </summary>
public interface ITaskRepository
{
    Task<TaskItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<TaskItem>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<TaskItem>> GetByStatusAsync(TaskItemStatus status, CancellationToken cancellationToken = default);
    Task<IEnumerable<TaskItem>> GetByAssigneeAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<TaskItem> AddAsync(TaskItem task, CancellationToken cancellationToken = default);
    Task UpdateAsync(TaskItem task, CancellationToken cancellationToken = default);
    Task DeleteAsync(TaskItem task, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
}
```

Create `TaskManager.Domain/Interfaces/IUnitOfWork.cs`:

```csharp
namespace TaskManager.Domain.Interfaces;

/// <summary>
/// Unit of Work pattern interface.
/// Ensures atomic operations across multiple repositories.
/// </summary>
public interface IUnitOfWork : IDisposable
{
    ITaskRepository Tasks { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
```

-----

## Building the Application Layer

The Application layer contains use cases and orchestrates the domain objects.

### Step 1: Create Common Interfaces

Create `TaskManager.Application/Common/Interfaces/IApplicationDbContext.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;

namespace TaskManager.Application.Common.Interfaces;

/// <summary>
/// Abstraction for the database context.
/// </summary>
public interface IApplicationDbContext
{
    DbSet<TaskItem> Tasks { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
```

Create `TaskManager.Application/Common/Interfaces/IDateTimeService.cs`:

```csharp
namespace TaskManager.Application.Common.Interfaces;

/// <summary>
/// Abstraction for date/time operations.
/// Allows for easier testing with predictable dates.
/// </summary>
public interface IDateTimeService
{
    DateTime Now { get; }
    DateTime UtcNow { get; }
}
```

### Step 2: Create DTOs

Create `TaskManager.Application/DTOs/TaskDto.cs`:

```csharp
using TaskManager.Domain.Enums;

namespace TaskManager.Application.DTOs;

/// <summary>
/// Data Transfer Object for TaskItem.
/// Used for transferring task data across layer boundaries.
/// </summary>
public sealed record TaskDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Priority { get; init; } = string.Empty;
    public DateTime? DueDate { get; init; }
    public Guid? AssignedToUserId { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public bool IsOverdue { get; init; }
}

/// <summary>
/// DTO for creating a new task.
/// </summary>
public sealed record CreateTaskDto
{
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public TaskPriority Priority { get; init; } = TaskPriority.Medium;
    public DateTime? DueDate { get; init; }
    public Guid? AssignedToUserId { get; init; }
}

/// <summary>
/// DTO for updating an existing task.
/// </summary>
public sealed record UpdateTaskDto
{
    public string? Title { get; init; }
    public string? Description { get; init; }
    public TaskPriority? Priority { get; init; }
    public DateTime? DueDate { get; init; }
}
```

### Step 3: Create Mapping Extensions

Create `TaskManager.Application/Common/Mappings/TaskMappings.cs`:

```csharp
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities;

namespace TaskManager.Application.Common.Mappings;

/// <summary>
/// Extension methods for mapping between domain entities and DTOs.
/// </summary>
public static class TaskMappings
{
    public static TaskDto ToDto(this TaskItem task)
    {
        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title.Value,
            Description = task.Description,
            Status = task.Status.ToString(),
            Priority = task.Priority.ToString(),
            DueDate = task.DueDate?.Value,
            AssignedToUserId = task.AssignedToUserId,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt,
            CompletedAt = task.CompletedAt,
            IsOverdue = task.DueDate?.IsOverdue ?? false
        };
    }

    public static IEnumerable<TaskDto> ToDtos(this IEnumerable<TaskItem> tasks)
    {
        return tasks.Select(t => t.ToDto());
    }
}
```

### Step 4: Create MediatR Pipeline Behaviors

Create `TaskManager.Application/Common/Behaviors/ValidationBehavior.cs`:

```csharp
using FluentValidation;
using MediatR;

namespace TaskManager.Application.Common.Behaviors;

/// <summary>
/// MediatR pipeline behavior that validates requests before they reach handlers.
/// This implements cross-cutting validation logic.
/// </summary>
public sealed class ValidationBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any())
        {
            return await next();
        }

        var context = new ValidationContext<TRequest>(request);

        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        var failures = validationResults
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Count != 0)
        {
            throw new ValidationException(failures);
        }

        return await next();
    }
}
```

Create `TaskManager.Application/Common/Behaviors/LoggingBehavior.cs`:

```csharp
using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;

namespace TaskManager.Application.Common.Behaviors;

/// <summary>
/// MediatR pipeline behavior that logs request handling.
/// </summary>
public sealed class LoggingBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;

        _logger.LogInformation("Handling {RequestName}", requestName);

        var stopwatch = Stopwatch.StartNew();

        var response = await next();

        stopwatch.Stop();

        _logger.LogInformation(
            "Handled {RequestName} in {ElapsedMilliseconds}ms",
            requestName,
            stopwatch.ElapsedMilliseconds);

        return response;
    }
}
```

### Step 5: Create Commands and Queries (CQRS Pattern)

#### Create Task Command

Create `TaskManager.Application/Features/Tasks/Commands/CreateTask/CreateTaskCommand.cs`:

```csharp
using MediatR;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Enums;

namespace TaskManager.Application.Features.Tasks.Commands.CreateTask;

/// <summary>
/// Command to create a new task.
/// Commands represent intentions to change the system state.
/// </summary>
public sealed record CreateTaskCommand : IRequest<TaskDto>
{
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public TaskPriority Priority { get; init; } = TaskPriority.Medium;
    public DateTime? DueDate { get; init; }
    public Guid? AssignedToUserId { get; init; }
}
```

Create `TaskManager.Application/Features/Tasks/Commands/CreateTask/CreateTaskCommandValidator.cs`:

```csharp
using FluentValidation;

namespace TaskManager.Application.Features.Tasks.Commands.CreateTask;

/// <summary>
/// Validator for CreateTaskCommand.
/// Validates input before it reaches the handler.
/// </summary>
public sealed class CreateTaskCommandValidator : AbstractValidator<CreateTaskCommand>
{
    public CreateTaskCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Title is required.")
            .MaximumLength(200)
            .WithMessage("Title must not exceed 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(2000)
            .WithMessage("Description must not exceed 2000 characters.")
            .When(x => x.Description != null);

        RuleFor(x => x.DueDate)
            .GreaterThan(DateTime.UtcNow.Date)
            .WithMessage("Due date must be in the future.")
            .When(x => x.DueDate.HasValue);

        RuleFor(x => x.Priority)
            .IsInEnum()
            .WithMessage("Invalid priority value.");
    }
}
```

Create `TaskManager.Application/Features/Tasks/Commands/CreateTask/CreateTaskCommandHandler.cs`:

```csharp
using MediatR;
using TaskManager.Application.Common.Mappings;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Tasks.Commands.CreateTask;

/// <summary>
/// Handler for CreateTaskCommand.
/// Contains the use case logic for creating a task.
/// </summary>
public sealed class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, TaskDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateTaskCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<TaskDto> Handle(
        CreateTaskCommand request,
        CancellationToken cancellationToken)
    {
        // Create the domain entity using factory method
        var task = TaskItem.Create(
            request.Title,
            request.Description,
            request.Priority,
            request.DueDate,
            request.AssignedToUserId);

        // Persist through repository
        await _unitOfWork.Tasks.AddAsync(task, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Return DTO (never expose domain entities directly)
        return task.ToDto();
    }
}
```

#### Update Task Command

Create `TaskManager.Application/Features/Tasks/Commands/UpdateTask/UpdateTaskCommand.cs`:

```csharp
using MediatR;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Enums;

namespace TaskManager.Application.Features.Tasks.Commands.UpdateTask;

/// <summary>
/// Command to update an existing task.
/// </summary>
public sealed record UpdateTaskCommand : IRequest<TaskDto>
{
    public Guid Id { get; init; }
    public string? Title { get; init; }
    public string? Description { get; init; }
    public TaskPriority? Priority { get; init; }
    public DateTime? DueDate { get; init; }
}
```

Create `TaskManager.Application/Features/Tasks/Commands/UpdateTask/UpdateTaskCommandHandler.cs`:

```csharp
using MediatR;
using TaskManager.Application.Common.Mappings;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Exceptions;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Tasks.Commands.UpdateTask;

/// <summary>
/// Handler for UpdateTaskCommand.
/// </summary>
public sealed class UpdateTaskCommandHandler : IRequestHandler<UpdateTaskCommand, TaskDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTaskCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<TaskDto> Handle(
        UpdateTaskCommand request,
        CancellationToken cancellationToken)
    {
        var task = await _unitOfWork.Tasks.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(TaskItem), request.Id);

        // Update only provided fields
        if (!string.IsNullOrWhiteSpace(request.Title))
        {
            task.UpdateTitle(request.Title);
        }

        if (request.Description != null)
        {
            task.UpdateDescription(request.Description);
        }

        if (request.Priority.HasValue)
        {
            task.SetPriority(request.Priority.Value);
        }

        if (request.DueDate.HasValue)
        {
            task.SetDueDate(request.DueDate.Value);
        }

        await _unitOfWork.Tasks.UpdateAsync(task, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return task.ToDto();
    }
}
```

#### Complete Task Command

Create `TaskManager.Application/Features/Tasks/Commands/CompleteTask/CompleteTaskCommand.cs`:

```csharp
using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Features.Tasks.Commands.CompleteTask;

/// <summary>
/// Command to mark a task as complete.
/// </summary>
public sealed record CompleteTaskCommand(Guid Id) : IRequest<TaskDto>;
```

Create `TaskManager.Application/Features/Tasks/Commands/CompleteTask/CompleteTaskCommandHandler.cs`:

```csharp
using MediatR;
using TaskManager.Application.Common.Mappings;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Exceptions;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Tasks.Commands.CompleteTask;

/// <summary>
/// Handler for CompleteTaskCommand.
/// </summary>
public sealed class CompleteTaskCommandHandler : IRequestHandler<CompleteTaskCommand, TaskDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public CompleteTaskCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<TaskDto> Handle(
        CompleteTaskCommand request,
        CancellationToken cancellationToken)
    {
        var task = await _unitOfWork.Tasks.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(TaskItem), request.Id);

        // Domain logic is encapsulated in the entity
        task.Complete();

        await _unitOfWork.Tasks.UpdateAsync(task, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return task.ToDto();
    }
}
```

#### Delete Task Command

Create `TaskManager.Application/Features/Tasks/Commands/DeleteTask/DeleteTaskCommand.cs`:

```csharp
using MediatR;

namespace TaskManager.Application.Features.Tasks.Commands.DeleteTask;

/// <summary>
/// Command to delete a task.
/// </summary>
public sealed record DeleteTaskCommand(Guid Id) : IRequest<bool>;
```

Create `TaskManager.Application/Features/Tasks/Commands/DeleteTask/DeleteTaskCommandHandler.cs`:

```csharp
using MediatR;
using TaskManager.Domain.Exceptions;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Tasks.Commands.DeleteTask;

/// <summary>
/// Handler for DeleteTaskCommand.
/// </summary>
public sealed class DeleteTaskCommandHandler : IRequestHandler<DeleteTaskCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteTaskCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(
        DeleteTaskCommand request,
        CancellationToken cancellationToken)
    {
        var task = await _unitOfWork.Tasks.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(TaskItem), request.Id);

        await _unitOfWork.Tasks.DeleteAsync(task, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
```

#### Get All Tasks Query

Create `TaskManager.Application/Features/Tasks/Queries/GetAllTasks/GetAllTasksQuery.cs`:

```csharp
using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Features.Tasks.Queries.GetAllTasks;

/// <summary>
/// Query to get all tasks.
/// Queries are read operations that don't change system state.
/// </summary>
public sealed record GetAllTasksQuery : IRequest<IEnumerable<TaskDto>>;
```

Create `TaskManager.Application/Features/Tasks/Queries/GetAllTasks/GetAllTasksQueryHandler.cs`:

```csharp
using MediatR;
using TaskManager.Application.Common.Mappings;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Tasks.Queries.GetAllTasks;

/// <summary>
/// Handler for GetAllTasksQuery.
/// </summary>
public sealed class GetAllTasksQueryHandler
    : IRequestHandler<GetAllTasksQuery, IEnumerable<TaskDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllTasksQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<TaskDto>> Handle(
        GetAllTasksQuery request,
        CancellationToken cancellationToken)
    {
        var tasks = await _unitOfWork.Tasks.GetAllAsync(cancellationToken);
        return tasks.ToDtos();
    }
}
```

#### Get Task By Id Query

Create `TaskManager.Application/Features/Tasks/Queries/GetTaskById/GetTaskByIdQuery.cs`:

```csharp
using MediatR;
using TaskManager.Application.DTOs;

namespace TaskManager.Application.Features.Tasks.Queries.GetTaskById;

/// <summary>
/// Query to get a task by its ID.
/// </summary>
public sealed record GetTaskByIdQuery(Guid Id) : IRequest<TaskDto?>;
```

Create `TaskManager.Application/Features/Tasks/Queries/GetTaskById/GetTaskByIdQueryHandler.cs`:

```csharp
using MediatR;
using TaskManager.Application.Common.Mappings;
using TaskManager.Application.DTOs;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Features.Tasks.Queries.GetTaskById;

/// <summary>
/// Handler for GetTaskByIdQuery.
/// </summary>
public sealed class GetTaskByIdQueryHandler : IRequestHandler<GetTaskByIdQuery, TaskDto?>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetTaskByIdQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<TaskDto?> Handle(
        GetTaskByIdQuery request,
        CancellationToken cancellationToken)
    {
        var task = await _unitOfWork.Tasks.GetByIdAsync(request.Id, cancellationToken);
        return task?.ToDto();
    }
}
```

### Step 6: Create Dependency Injection Extension

Create `TaskManager.Application/DependencyInjection.cs`:

```csharp
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using TaskManager.Application.Common.Behaviors;

namespace TaskManager.Application;

/// <summary>
/// Extension methods for configuring Application layer services.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        var assembly = typeof(DependencyInjection).Assembly;

        // Register MediatR
        services.AddMediatR(cfg => {
            cfg.RegisterServicesFromAssembly(assembly);
        });

        // Register FluentValidation
        services.AddValidatorsFromAssembly(assembly);

        // Register pipeline behaviors
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));

        return services;
    }
}
```

-----

## Building the Infrastructure Layer

The Infrastructure layer implements interfaces defined in inner layers.

### Step 1: Create the DbContext

Create `TaskManager.Infrastructure/Persistence/ApplicationDbContext.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Domain.Entities;

namespace TaskManager.Infrastructure.Persistence;

/// <summary>
/// Entity Framework Core database context.
/// Implements the application's data access abstraction.
/// </summary>
public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply configurations from current assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
```

### Step 2: Create Entity Configuration

Create `TaskManager.Infrastructure/Persistence/Configurations/TaskItemConfiguration.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Enums;
using TaskManager.Domain.ValueObjects;

namespace TaskManager.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity Framework configuration for TaskItem.
/// Configures how the entity maps to the database.
/// </summary>
public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
{
    public void Configure(EntityTypeBuilder<TaskItem> builder)
    {
        builder.ToTable("Tasks");

        builder.HasKey(t => t.Id);

        // Configure value object conversion
        builder.Property(t => t.Title)
            .HasConversion(
                title => title.Value,
                value => TaskTitle.Create(value))
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(t => t.Description)
            .HasMaxLength(2000);

        builder.Property(t => t.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(t => t.Priority)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        // Configure optional DueDate value object
        builder.Property(t => t.DueDate)
            .HasConversion(
                dueDate => dueDate != null ? dueDate.Value : (DateTime?)null,
                value => value.HasValue ? DueDate.Create(value.Value) : null);

        builder.Property(t => t.CreatedAt)
            .IsRequired();

        // Ignore domain events - they're not persisted
        builder.Ignore(t => t.DomainEvents);

        // Create index for common queries
        builder.HasIndex(t => t.Status);
        builder.HasIndex(t => t.AssignedToUserId);
        builder.HasIndex(t => t.DueDate);
    }
}
```

### Step 3: Implement Repository

Create `TaskManager.Infrastructure/Persistence/Repositories/TaskRepository.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Infrastructure.Persistence.Repositories;

/// <summary>
/// Concrete implementation of ITaskRepository.
/// Uses Entity Framework Core for data access.
/// </summary>
public class TaskRepository : ITaskRepository
{
    private readonly ApplicationDbContext _context;

    public TaskRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TaskItem?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<TaskItem>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.Tasks
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<TaskItem>> GetByStatusAsync(
        TaskItemStatus status,
        CancellationToken cancellationToken = default)
    {
        return await _context.Tasks
            .Where(t => t.Status == status)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<TaskItem>> GetByAssigneeAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Tasks
            .Where(t => t.AssignedToUserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<TaskItem> AddAsync(
        TaskItem task,
        CancellationToken cancellationToken = default)
    {
        await _context.Tasks.AddAsync(task, cancellationToken);
        return task;
    }

    public Task UpdateAsync(
        TaskItem task,
        CancellationToken cancellationToken = default)
    {
        _context.Tasks.Update(task);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(
        TaskItem task,
        CancellationToken cancellationToken = default)
    {
        _context.Tasks.Remove(task);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _context.Tasks
            .AnyAsync(t => t.Id == id, cancellationToken);
    }
}
```

### Step 4: Implement Unit of Work

Create `TaskManager.Infrastructure/Persistence/UnitOfWork.cs`:

```csharp
using TaskManager.Domain.Interfaces;
using TaskManager.Infrastructure.Persistence.Repositories;

namespace TaskManager.Infrastructure.Persistence;

/// <summary>
/// Implements the Unit of Work pattern.
/// Coordinates changes across multiple repositories.
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private ITaskRepository? _taskRepository;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public ITaskRepository Tasks =>
        _taskRepository ??= new TaskRepository(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
```

### Step 5: Implement Services

Create `TaskManager.Infrastructure/Services/DateTimeService.cs`:

```csharp
using TaskManager.Application.Common.Interfaces;

namespace TaskManager.Infrastructure.Services;

/// <summary>
/// Implementation of IDateTimeService.
/// Provides current date/time information.
/// </summary>
public class DateTimeService : IDateTimeService
{
    public DateTime Now => DateTime.Now;
    public DateTime UtcNow => DateTime.UtcNow;
}
```

### Step 6: Create Dependency Injection Extension

Create `TaskManager.Infrastructure/DependencyInjection.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TaskManager.Application.Common.Interfaces;
using TaskManager.Domain.Interfaces;
using TaskManager.Infrastructure.Persistence;
using TaskManager.Infrastructure.Services;

namespace TaskManager.Infrastructure;

/// <summary>
/// Extension methods for configuring Infrastructure layer services.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Configure database context
        // Using InMemory database for this tutorial
        // In production, use SQL Server, PostgreSQL, etc.
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseInMemoryDatabase("TaskManagerDb"));

        // For SQL Server, uncomment the following:
        // services.AddDbContext<ApplicationDbContext>(options =>
        //     options.UseSqlServer(
        //         configuration.GetConnectionString("DefaultConnection"),
        //         b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<ApplicationDbContext>());

        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddTransient<IDateTimeService, DateTimeService>();

        return services;
    }
}
```

-----

## Building the Presentation Layer

The Presentation layer is the entry point for users.

### Step 1: Create Exception Handling Middleware

Create `TaskManager.Api/Middleware/ExceptionHandlingMiddleware.cs`:

```csharp
using System.Net;
using System.Text.Json;
using FluentValidation;
using TaskManager.Domain.Exceptions;

namespace TaskManager.Api.Middleware;

/// <summary>
/// Global exception handling middleware.
/// Converts exceptions to appropriate HTTP responses.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new ErrorResponse();

        switch (exception)
        {
            case ValidationException validationException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = "Validation failed";
                response.Errors = validationException.Errors
                    .Select(e => e.ErrorMessage)
                    .ToList();
                break;

            case EntityNotFoundException:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                response.Message = exception.Message;
                break;

            case BusinessRuleViolationException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = exception.Message;
                break;

            case DomainException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = exception.Message;
                break;

            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response.Message = "An error occurred while processing your request";
                break;
        }

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}

/// <summary>
/// Standard error response format.
/// </summary>
public class ErrorResponse
{
    public string Message { get; set; } = string.Empty;
    public List<string> Errors { get; set; } = new();
}
```

### Step 2: Create the Tasks Controller

Create `TaskManager.Api/Controllers/TasksController.cs`:

```csharp
using MediatR;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.DTOs;
using TaskManager.Application.Features.Tasks.Commands.CompleteTask;
using TaskManager.Application.Features.Tasks.Commands.CreateTask;
using TaskManager.Application.Features.Tasks.Commands.DeleteTask;
using TaskManager.Application.Features.Tasks.Commands.UpdateTask;
using TaskManager.Application.Features.Tasks.Queries.GetAllTasks;
using TaskManager.Application.Features.Tasks.Queries.GetTaskById;
using TaskManager.Domain.Enums;

namespace TaskManager.Api.Controllers;

/// <summary>
/// API Controller for Task operations.
/// Uses MediatR to dispatch commands and queries.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class TasksController : ControllerBase
{
    private readonly IMediator _mediator;

    public TasksController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all tasks.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TaskDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<TaskDto>>> GetAll(
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetAllTasksQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get a task by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskDto>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetTaskByIdQuery(id), cancellationToken);

        if (result is null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    /// <summary>
    /// Create a new task.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TaskDto>> Create(
        [FromBody] CreateTaskRequest request,
        CancellationToken cancellationToken)
    {
        var command = new CreateTaskCommand
        {
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            DueDate = request.DueDate,
            AssignedToUserId = request.AssignedToUserId
        };

        var result = await _mediator.Send(command, cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Id },
            result);
    }

    /// <summary>
    /// Update an existing task.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TaskDto>> Update(
        Guid id,
        [FromBody] UpdateTaskRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateTaskCommand
        {
            Id = id,
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            DueDate = request.DueDate
        };

        var result = await _mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Mark a task as complete.
    /// </summary>
    [HttpPost("{id:guid}/complete")]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TaskDto>> Complete(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CompleteTaskCommand(id), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Delete a task.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteTaskCommand(id), cancellationToken);
        return NoContent();
    }
}

/// <summary>
/// Request model for creating a task.
/// </summary>
public record CreateTaskRequest
{
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public TaskPriority Priority { get; init; } = TaskPriority.Medium;
    public DateTime? DueDate { get; init; }
    public Guid? AssignedToUserId { get; init; }
}

/// <summary>
/// Request model for updating a task.
/// </summary>
public record UpdateTaskRequest
{
    public string? Title { get; init; }
    public string? Description { get; init; }
    public TaskPriority? Priority { get; init; }
    public DateTime? DueDate { get; init; }
}
```

### Step 3: Configure Program.cs

Replace the contents of `TaskManager.Api/Program.cs`:

```csharp
using TaskManager.Api.Middleware;
using TaskManager.Application;
using TaskManager.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services from each layer
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// Add API services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title = "Task Manager API",
        Version = "v1",
        Description = "A Clean Architecture Task Management API"
    });
});

var app = builder.Build();

// Configure middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Add custom exception handling
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();

// Make Program accessible for integration tests
public partial class Program { }
```

-----

## Dependency Injection Configuration

Here’s a summary of how dependency injection flows through the layers:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Program.cs                               │
│    builder.Services.AddApplicationServices();                   │
│    builder.Services.AddInfrastructureServices(config);          │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        ▼                                           ▼
┌───────────────────┐                   ┌───────────────────────┐
│   Application DI  │                   │   Infrastructure DI   │
├───────────────────┤                   ├───────────────────────┤
│ - MediatR         │                   │ - DbContext           │
│ - Validators      │                   │ - Repositories        │
│ - Behaviors       │                   │ - Services            │
└───────────────────┘                   │ - UnitOfWork          │
                                        └───────────────────────┘
```

### Key Points

1. **Interface Segregation**: Interfaces are defined in Domain/Application layers
1. **Dependency Inversion**: High-level modules don’t depend on low-level modules
1. **Single Responsibility**: Each registration method handles only its layer’s services

-----

## Running the Application

### Step 1: Build the Solution

```bash
cd TaskManager
dotnet build
```

### Step 2: Run the API

```bash
cd TaskManager.Api
dotnet run
```

### Step 3: Access Swagger UI

Open your browser and navigate to:

```
https://localhost:5001/swagger
```

### Step 4: Test the API

Using Swagger UI or curl, test the endpoints:

**Create a Task:**

```bash
curl -X POST "https://localhost:5001/api/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn Clean Architecture",
    "description": "Complete the tutorial",
    "priority": 2,
    "dueDate": "2024-12-31"
  }'
```

**Get All Tasks:**

```bash
curl -X GET "https://localhost:5001/api/tasks"
```

**Complete a Task:**

```bash
curl -X POST "https://localhost:5001/api/tasks/{taskId}/complete"
```

-----

## Testing Strategy

Clean Architecture makes testing straightforward by separating concerns.

### Unit Tests for Domain Layer

Create `TaskManager.Domain.Tests/Entities/TaskItemTests.cs`:

```csharp
using FluentAssertions;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Exceptions;

namespace TaskManager.Domain.Tests.Entities;

public class TaskItemTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateTask()
    {
        // Arrange
        var title = "Test Task";
        var description = "Test Description";

        // Act
        var task = TaskItem.Create(title, description);

        // Assert
        task.Should().NotBeNull();
        task.Title.Value.Should().Be(title);
        task.Description.Should().Be(description);
        task.Status.Should().Be(TaskItemStatus.Todo);
    }

    [Fact]
    public void Complete_WhenTodo_ShouldMarkAsComplete()
    {
        // Arrange
        var task = TaskItem.Create("Test Task");

        // Act
        task.Complete();

        // Assert
        task.Status.Should().Be(TaskItemStatus.Done);
        task.CompletedAt.Should().NotBeNull();
    }

    [Fact]
    public void Complete_WhenAlreadyDone_ShouldThrowException()
    {
        // Arrange
        var task = TaskItem.Create("Test Task");
        task.Complete();

        // Act
        var act = () => task.Complete();

        // Assert
        act.Should().Throw<BusinessRuleViolationException>()
            .WithMessage("*already completed*");
    }

    [Fact]
    public void StartProgress_WhenTodo_ShouldChangeStatus()
    {
        // Arrange
        var task = TaskItem.Create("Test Task");

        // Act
        task.StartProgress();

        // Assert
        task.Status.Should().Be(TaskItemStatus.InProgress);
    }
}
```

### Unit Tests for Application Layer

Create `TaskManager.Application.Tests/Features/Tasks/CreateTaskCommandTests.cs`:

```csharp
using FluentAssertions;
using Moq;
using TaskManager.Application.Features.Tasks.Commands.CreateTask;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Interfaces;

namespace TaskManager.Application.Tests.Features.Tasks;

public class CreateTaskCommandTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<ITaskRepository> _taskRepositoryMock;
    private readonly CreateTaskCommandHandler _handler;

    public CreateTaskCommandTests()
    {
        _taskRepositoryMock = new Mock<ITaskRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _unitOfWorkMock.Setup(u => u.Tasks).Returns(_taskRepositoryMock.Object);
        _handler = new CreateTaskCommandHandler(_unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldCreateTask()
    {
        // Arrange
        var command = new CreateTaskCommand
        {
            Title = "Test Task",
            Description = "Test Description",
            Priority = TaskPriority.High
        };

        _taskRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<TaskItem>(), default))
            .ReturnsAsync((TaskItem t, CancellationToken _) => t);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be(command.Title);
        result.Priority.Should().Be("High");

        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(default), Times.Once);
    }
}
```

### Integration Tests

Create `TaskManager.Api.Tests/Controllers/TasksControllerTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using TaskManager.Application.DTOs;

namespace TaskManager.Api.Tests.Controllers;

public class TasksControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public TasksControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateTask_WithValidData_ReturnsCreated()
    {
        // Arrange
        var request = new
        {
            Title = "Integration Test Task",
            Description = "Testing the API",
            Priority = 1
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tasks", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var task = await response.Content.ReadFromJsonAsync<TaskDto>();
        task.Should().NotBeNull();
        task!.Title.Should().Be(request.Title);
    }

    [Fact]
    public async Task GetTask_WhenNotFound_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync($"/api/tasks/{Guid.NewGuid()}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
```

-----

## Best Practices and Common Pitfalls

### Best Practices

**1. Keep the Domain Layer Pure**

The Domain layer should have no dependencies on frameworks or external concerns. It contains only business logic.

```csharp
// ✅ Good - Pure domain logic
public class TaskItem
{
    public void Complete()
    {
        if (Status == TaskItemStatus.Done)
            throw new BusinessRuleViolationException("Already completed");
        Status = TaskItemStatus.Done;
    }
}

// ❌ Bad - Framework dependency in domain
public class TaskItem
{
    [Required]  // Framework attribute
    public string Title { get; set; }
}
```

**2. Use Value Objects for Business Concepts**

Value objects encapsulate validation and behavior.

```csharp
// ✅ Good - Value object with validation
public class Email
{
    public string Value { get; }
    private Email(string value) => Value = value;
    
    public static Email Create(string value)
    {
        if (!IsValidEmail(value))
            throw new DomainException("Invalid email");
        return new Email(value);
    }
}

// ❌ Bad - Primitive obsession
public class User
{
    public string Email { get; set; }  // No validation
}
```

**3. Repository Interfaces in Domain, Implementation in Infrastructure**

```csharp
// Domain Layer
public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
}

// Infrastructure Layer
public class UserRepository : IUserRepository
{
    private readonly DbContext _context;
    public async Task<User?> GetByIdAsync(Guid id)
        => await _context.Users.FindAsync(id);
}
```

**4. Use MediatR for Decoupling**

MediatR separates request handling from controllers.

```csharp
// Controller is thin - just dispatches
[HttpPost]
public async Task<IActionResult> Create(CreateTaskCommand command)
    => Ok(await _mediator.Send(command));
```

### Common Pitfalls

**1. Anemic Domain Model**

```csharp
// ❌ Bad - Logic in service, not entity
public class TaskService
{
    public void CompleteTask(TaskItem task)
    {
        task.Status = TaskStatus.Done;  // Logic outside entity
        task.CompletedAt = DateTime.UtcNow;
    }
}

// ✅ Good - Logic in entity
public class TaskItem
{
    public void Complete()
    {
        Status = TaskStatus.Done;
        CompletedAt = DateTime.UtcNow;
    }
}
```

**2. Leaking Domain Objects**

```csharp
// ❌ Bad - Exposing domain entity
[HttpGet("{id}")]
public async Task<TaskItem> GetById(Guid id)  // Returns entity!
    => await _repository.GetByIdAsync(id);

// ✅ Good - Return DTO
[HttpGet("{id}")]
public async Task<TaskDto> GetById(Guid id)
    => (await _repository.GetByIdAsync(id)).ToDto();
```

**3. Wrong Direction Dependencies**

```csharp
// ❌ Bad - Domain depends on Infrastructure
// In Domain Layer:
using Microsoft.EntityFrameworkCore;  // Infrastructure concern!

// ✅ Good - Infrastructure depends on Domain
// In Infrastructure Layer:
using TaskManager.Domain.Entities;  // Correct direction
```

**4. Fat Controllers**

```csharp
// ❌ Bad - Logic in controller
[HttpPost]
public async Task<IActionResult> Create(CreateTaskRequest request)
{
    // Validation logic
    // Business logic
    // Persistence logic
    // Return mapping
}

// ✅ Good - Controller delegates
[HttpPost]
public async Task<IActionResult> Create(CreateTaskCommand command)
    => Ok(await _mediator.Send(command));
```

-----

## Exercises

Test your understanding with these exercises:

### Exercise 1: Add Task Assignment Feature

Implement the ability to assign tasks to users:

1. Create an `AssignTaskCommand` in the Application layer
1. Add a validator to ensure the user exists
1. Create the command handler
1. Add an endpoint in the controller

### Exercise 2: Add Task Filtering

Implement filtering tasks by status:

1. Create a `GetTasksByStatusQuery`
1. Implement the query handler
1. Add a new endpoint with query parameter

### Exercise 3: Add Domain Events Publishing

Implement domain event publishing:

1. Create an `IDomainEventPublisher` interface
1. Implement it using MediatR’s `INotificationHandler`
1. Publish events when tasks are completed
1. Create a handler that logs when tasks are completed

### Exercise 4: Add Caching

Implement caching for task queries:

1. Create an `ICacheService` interface in Application
1. Implement it in Infrastructure using `IMemoryCache`
1. Add caching to the `GetAllTasksQueryHandler`

### Exercise 5: Add Specification Pattern

Implement the Specification pattern for complex queries:

1. Create a base `Specification<T>` class in Domain
1. Create `TaskByStatusSpecification`
1. Create `OverdueTasksSpecification`
1. Update the repository to accept specifications

-----

## Summary

Congratulations! You’ve built a complete application using Clean Architecture principles. Let’s recap what you’ve learned:

### Key Concepts

|Concept             |Description                     |
|--------------------|--------------------------------|
|Dependency Rule     |Dependencies point inward       |
|Domain Layer        |Business entities and rules     |
|Application Layer   |Use cases and orchestration     |
|Infrastructure Layer|External concerns implementation|
|Presentation Layer  |User interface and API          |

### Benefits of Clean Architecture

1. **Testability**: Each layer can be tested in isolation
1. **Maintainability**: Changes are localized to specific layers
1. **Flexibility**: Easy to swap implementations (databases, UI frameworks)
1. **Scalability**: Clear boundaries for team collaboration
1. **Longevity**: Business logic survives technology changes

### When to Use Clean Architecture

**Good Fit:**

- Enterprise applications
- Long-lived projects
- Complex business domains
- Multiple UI requirements
- Team collaboration

**Consider Alternatives:**

- Simple CRUD applications
- Prototypes or MVPs
- Time-sensitive projects with simple domains

### Further Reading

- “Clean Architecture” by Robert C. Martin
- “Domain-Driven Design” by Eric Evans
- “Implementing Domain-Driven Design” by Vaughn Vernon

### Project Repository Structure (Final)

```
TaskManager/
├── TaskManager.sln
├── src/
│   ├── TaskManager.Domain/
│   │   ├── Common/
│   │   │   └── BaseEntity.cs
│   │   ├── Entities/
│   │   │   └── TaskItem.cs
│   │   ├── ValueObjects/
│   │   │   ├── TaskTitle.cs
│   │   │   └── DueDate.cs
│   │   ├── Enums/
│   │   │   └── TaskStatus.cs
│   │   ├── Events/
│   │   │   └── TaskCreatedEvent.cs
│   │   ├── Exceptions/
│   │   │   └── DomainException.cs
│   │   └── Interfaces/
│   │       ├── ITaskRepository.cs
│   │       └── IUnitOfWork.cs
│   ├── TaskManager.Application/
│   │   ├── Common/
│   │   │   ├── Behaviors/
│   │   │   ├── Interfaces/
│   │   │   └── Mappings/
│   │   ├── DTOs/
│   │   │   └── TaskDto.cs
│   │   ├── Features/
│   │   │   └── Tasks/
│   │   │       ├── Commands/
│   │   │       └── Queries/
│   │   └── DependencyInjection.cs
│   ├── TaskManager.Infrastructure/
│   │   ├── Persistence/
│   │   │   ├── Configurations/
│   │   │   ├── Repositories/
│   │   │   ├── ApplicationDbContext.cs
│   │   │   └── UnitOfWork.cs
│   │   ├── Services/
│   │   │   └── DateTimeService.cs
│   │   └── DependencyInjection.cs
│   └── TaskManager.Api/
│       ├── Controllers/
│       │   └── TasksController.cs
│       ├── Middleware/
│       │   └── ExceptionHandlingMiddleware.cs
│       └── Program.cs
└── tests/
    ├── TaskManager.Domain.Tests/
    ├── TaskManager.Application.Tests/
    └── TaskManager.Api.Tests/
```

-----

**Happy Coding!** 🚀

You now have a solid foundation in Clean Architecture. Practice by extending this application with new features, and remember: the goal is maintainable, testable code that can evolve with your business needs.
