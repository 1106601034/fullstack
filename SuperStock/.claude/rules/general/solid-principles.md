# SOLID Principles

**Priority: 🔴 CRITICAL**
**Applies to: ALL code (Frontend, Backend, Services)**

## Overview
SOLID is a set of five design principles that make software designs more understandable, flexible, and maintainable.

## 1. Single Responsibility Principle (SRP)

### Rule
Every module, class, or function should have ONE reason to change.

### ✅ Good Example
```typescript
// Each class has a single responsibility
class UserValidator {
  validate(user: User): ValidationResult {
    // Only validation logic
  }
}

class UserRepository {
  save(user: User): Promise<void> {
    // Only database operations
  }
}

class UserNotifier {
  sendWelcomeEmail(user: User): Promise<void> {
    // Only notification logic
  }
}
```

### ❌ Bad Example
```typescript
// Class doing too many things
class UserService {
  validate(user: User): boolean { /* validation */ }
  save(user: User): void { /* database */ }
  sendEmail(user: User): void { /* notification */ }
  generateReport(user: User): Report { /* reporting */ }
}
```

## 2. Open/Closed Principle (OCP)

### Rule
Software entities should be OPEN for extension but CLOSED for modification.

### ✅ Good Example
```typescript
// Use composition and interfaces
interface PaymentProcessor {
  process(amount: number): Promise<PaymentResult>
}

class StripeProcessor implements PaymentProcessor {
  process(amount: number): Promise<PaymentResult> {
    // Stripe-specific logic
  }
}

class PayPalProcessor implements PaymentProcessor {
  process(amount: number): Promise<PaymentResult> {
    // PayPal-specific logic
  }
}

// Easy to add new payment methods without modifying existing code
```

### ❌ Bad Example
```typescript
// Requires modification for new payment methods
class PaymentService {
  process(amount: number, method: string) {
    if (method === 'stripe') {
      // Stripe logic
    } else if (method === 'paypal') {
      // PayPal logic
    }
    // Adding new method requires modifying this function
  }
}
```

## 3. Liskov Substitution Principle (LSP)

### Rule
Objects of a superclass should be replaceable with objects of its subclasses without breaking the application.

### ✅ Good Example
```typescript
abstract class Bird {
  abstract move(): void
}

class FlyingBird extends Bird {
  move(): void {
    this.fly()
  }

  private fly(): void {
    // Flying logic
  }
}

class Penguin extends Bird {
  move(): void {
    this.swim()
  }

  private swim(): void {
    // Swimming logic
  }
}
```

### ❌ Bad Example
```typescript
class Bird {
  fly(): void {
    // Flying logic
  }
}

class Penguin extends Bird {
  fly(): void {
    throw new Error("Penguins can't fly!") // Violates LSP
  }
}
```

## 4. Interface Segregation Principle (ISP)

### Rule
Clients should not be forced to depend on interfaces they don't use.

### ✅ Good Example
```typescript
// Specific, focused interfaces
interface Readable {
  read(): string
}

interface Writable {
  write(data: string): void
}

interface Deletable {
  delete(): void
}

// Classes implement only what they need
class ReadOnlyFile implements Readable {
  read(): string { return this.content }
}

class EditableFile implements Readable, Writable, Deletable {
  read(): string { return this.content }
  write(data: string): void { this.content = data }
  delete(): void { this.content = '' }
}
```

### ❌ Bad Example
```typescript
// Fat interface forcing unnecessary implementations
interface FileOperations {
  read(): string
  write(data: string): void
  delete(): void
  compress(): void
  encrypt(): void
}

// Forced to implement unused methods
class SimpleFile implements FileOperations {
  read(): string { return this.content }
  write(data: string): void { this.content = data }
  delete(): void { this.content = '' }
  compress(): void { /* Not needed but must implement */ }
  encrypt(): void { /* Not needed but must implement */ }
}
```

## 5. Dependency Inversion Principle (DIP)

### Rule
- High-level modules should not depend on low-level modules
- Both should depend on abstractions
- Abstractions should not depend on details

### ✅ Good Example
```typescript
// Abstraction
interface Logger {
  log(message: string): void
}

// Low-level implementations
class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(message)
  }
}

class FileLogger implements Logger {
  log(message: string): void {
    // Write to file
  }
}

// High-level module depends on abstraction
class UserService {
  constructor(private logger: Logger) {} // Dependency injection

  createUser(userData: UserData) {
    // Business logic
    this.logger.log('User created')
  }
}
```

### ❌ Bad Example
```typescript
// High-level module directly depends on low-level module
class UserService {
  private logger = new ConsoleLogger() // Direct dependency

  createUser(userData: UserData) {
    // Business logic
    this.logger.log('User created') // Tightly coupled
  }
}
```

## Enforcement Checklist

Before writing any code, verify:

- [ ] **SRP**: Each component has ONE clear responsibility
- [ ] **OCP**: New features can be added without modifying existing code
- [ ] **LSP**: Subclasses can replace parent classes without issues
- [ ] **ISP**: Interfaces are small and focused
- [ ] **DIP**: Dependencies are injected, not created internally

## React-Specific Examples

### SRP in React
```typescript
// ✅ Good: Separate concerns
const UserAvatar = ({ imageUrl }: Props) => <img src={imageUrl} />
const UserName = ({ name }: Props) => <h3>{name}</h3>
const UserBio = ({ bio }: Props) => <p>{bio}</p>

// ❌ Bad: Component doing too much
const UserProfile = ({ user, posts, friends }) => {
  // Handles user display, posts, friends, API calls, etc.
}
```

### OCP in React
```typescript
// ✅ Good: Extensible via composition
const Button = ({ variant, children, ...props }) => {
  const className = buttonVariants[variant]
  return <button className={className} {...props}>{children}</button>
}

// Easy to add new variants without modifying Button
```

## Common Violations to Avoid

1. **God Classes**: Classes that know too much or do too much
2. **Rigid Inheritance**: Deep inheritance hierarchies
3. **Feature Envy**: Methods that use data from other classes more than their own
4. **Inappropriate Intimacy**: Classes that know too much about each other's internals
5. **Leaky Abstractions**: Implementation details exposed through interfaces

## Remember
SOLID principles are not rules to follow blindly, but guidelines to create maintainable, flexible, and understandable code. Apply them pragmatically based on context.