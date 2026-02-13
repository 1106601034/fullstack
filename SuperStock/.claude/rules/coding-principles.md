# Coding Principles

This document outlines the fundamental coding principles that must be followed in the Airbotix project.

## Core Principles

### SOLID Principles

#### Single Responsibility Principle (SRP)
- Each class/component should have only one reason to change
- One component = one responsibility
- Separate concerns clearly

**Examples:**
```typescript
// ✅ Good - Single responsibility
const UserProfile = ({ user }: { user: User }) => {
  return <div>{user.name}</div>
}

const UserActions = ({ onEdit, onDelete }: UserActionsProps) => {
  return <div>...</div>
}

// ❌ Bad - Multiple responsibilities
const UserComponent = ({ user, onEdit, onDelete, onSave, onCancel }) => {
  // Handles display, editing, and actions - too many responsibilities
}
```

#### Open/Closed Principle (OCP)
- Open for extension, closed for modification
- Use composition and interfaces for extensibility

```typescript
// ✅ Good - Extensible through props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

// ❌ Bad - Hard to extend
const Button = ({ isPrimary, isSecondary, isDanger, isSmall, isMedium, isLarge }) => {
  // Too many specific props
}
```

#### Liskov Substitution Principle (LSP)
- Derived classes must be substitutable for their base classes
- Interfaces should be implementable without breaking functionality

#### Interface Segregation Principle (ISP)
- Clients should not depend on interfaces they don't use
- Create specific, focused interfaces

```typescript
// ✅ Good - Segregated interfaces
interface Readable {
  read(): string
}

interface Writable {
  write(data: string): void
}

// ❌ Bad - Fat interface
interface FileHandler {
  read(): string
  write(data: string): void
  compress(): void
  encrypt(): void
  backup(): void
}
```

#### Dependency Inversion Principle (DIP)
- Depend on abstractions, not concretions
- High-level modules should not depend on low-level modules

### KISS (Keep It Simple, Stupid)
- Prefer simple solutions over complex ones
- Avoid over-engineering
- Write clear, readable code

```typescript
// ✅ Good - Simple and clear
const isEven = (num: number): boolean => num % 2 === 0

// ❌ Bad - Unnecessarily complex
const isEven = (num: number): boolean => {
  const binaryString = num.toString(2)
  return binaryString[binaryString.length - 1] === '0'
}
```

### DRY (Don't Repeat Yourself)
- Avoid code duplication
- Extract common functionality into reusable components/utilities
- Single source of truth for data and logic

```typescript
// ✅ Good - Reusable utility
const formatCurrency = (amount: number): string => 
  new Intl.NumberFormat('en-AU', { 
    style: 'currency', 
    currency: 'AUD' 
  }).format(amount)

// Usage
const price1 = formatCurrency(100)
const price2 = formatCurrency(250)

// ❌ Bad - Repeated logic
const price1 = `$${(100).toFixed(2)}`
const price2 = `$${(250).toFixed(2)}`
```

## File Organization Rules

### Maximum File Size: 1000 Lines
- **Hard limit**: No single file should exceed 1000 lines
- **Recommended**: Keep files under 500 lines for better maintainability
- **Reason**: Context window limitations and readability

**When a file exceeds 1000 lines:**
1. Break into smaller, focused components
2. Extract utilities to separate files
3. Split complex logic into custom hooks
4. Consider feature-based organization

```typescript
// ✅ Good - Broken down structure
// components/Workshop/WorkshopCard.tsx (150 lines)
// components/Workshop/WorkshopDetails.tsx (200 lines)
// components/Workshop/WorkshopBooking.tsx (100 lines)
// hooks/useWorkshopData.ts (80 lines)

// ❌ Bad - Monolithic file
// components/WorkshopComponent.tsx (1200 lines)
```

### Component Breakdown Strategy
When breaking down large files:

1. **Extract UI Components**
```typescript
// Before: Large WorkshopPage.tsx
// After:
// - WorkshopHero.tsx
// - WorkshopDescription.tsx
// - WorkshopSyllabus.tsx
// - WorkshopPricing.tsx
// - WorkshopBookingForm.tsx
```

2. **Extract Custom Hooks**
```typescript
// Extract state management
const useWorkshopBooking = () => {
  const [form, setForm] = useState(...)
  const [errors, setErrors] = useState(...)
  // ... booking logic
  return { form, errors, handleSubmit }
}
```

3. **Extract Utilities**
```typescript
// utils/workshop.ts
export const calculateWorkshopPrice = (students: number, duration: number) => {
  // pricing logic
}

export const formatWorkshopDate = (date: Date) => {
  // date formatting logic
}
```

## String Constants Rule

### No Magic Strings
- **All strings must be constants**
- Define constants at file or module level
- Use descriptive names

```typescript
// ✅ Good - String constants
const WORKSHOP_TYPES = {
  AI_ROBOTICS: 'ai-robotics-beginners',
  ROBOTICS_FUNDAMENTALS: 'robotics-fundamentals',
  COMPUTER_VISION: 'computer-vision-makers',
} as const

const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Please enter a valid email address',
  REQUIRED_FIELD: 'This field is required',
  BOOKING_FAILED: 'Workshop booking failed. Please try again.',
} as const

const API_ENDPOINTS = {
  WORKSHOPS: '/api/workshops',
  BOOKINGS: '/api/bookings',
  CONTACT: '/api/contact',
} as const

// Usage
const workshopType = WORKSHOP_TYPES.AI_ROBOTICS
const errorMsg = ERROR_MESSAGES.INVALID_EMAIL

// ❌ Bad - Magic strings
const workshopType = 'ai-robotics-beginners' // Where does this come from?
const errorMsg = 'Please enter a valid email address' // Repeated everywhere
```

### Constants Organization
```typescript
// constants/workshop.ts
export const WORKSHOP_CONSTANTS = {
  TYPES: {
    AI_ROBOTICS: 'ai-robotics-beginners',
    ROBOTICS_FUNDAMENTALS: 'robotics-fundamentals',
    COMPUTER_VISION: 'computer-vision-makers',
  },
  DURATIONS: {
    SHORT: '6 weeks',
    MEDIUM: '8 weeks',
    LONG: '12 weeks',
  },
  STATUS: {
    AVAILABLE: 'available',
    FULL: 'full',
    COMING_SOON: 'coming-soon',
  },
} as const
```

## TypeScript Interface Requirement

### Mandatory Interfaces
- **All component props must have interfaces**
- **All API responses must have interfaces**
- **All data structures must have interfaces**
- **Use `interface` instead of `type` for object structures**

```typescript
// ✅ Good - Proper interfaces
interface WorkshopCardProps {
  workshop: Workshop
  onBookClick: (workshopId: string) => void
  isLoading?: boolean
}

interface ApiResponse<T> {
  data: T
  status: 'success' | 'error'
  message?: string
}

interface WorkshopBookingForm {
  workshopId: string
  organizationName: string
  contactEmail: string
  studentCount: number
  preferredDate: string
  notes?: string
}

// ❌ Bad - Missing interfaces or using any
const WorkshopCard = ({ workshop, onBookClick, isLoading }) => {
  // No interface for props
}

const handleApiResponse = (response: any) => {
  // Using any instead of proper interface
}
```

### Interface Best Practices
1. **Descriptive Names**: Use clear, descriptive names
2. **Optional Properties**: Mark optional properties with `?`
3. **Extend When Appropriate**: Use inheritance for related interfaces
4. **Generic Interfaces**: Use generics for reusable structures

```typescript
// ✅ Good - Well-structured interfaces
interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

interface Workshop extends BaseEntity {
  title: string
  description: string
  duration: string
  price: number
  capacity: number
  instructor: Instructor
}

interface WorkshopWithBookings extends Workshop {
  bookings: Booking[]
  availableSpots: number
}
```

## Enforcement Rules

### Automated Checks
These rules should be enforced through:
1. **ESLint rules** for string constants and complexity
2. **File size pre-commit hooks**
3. **TypeScript strict mode** for interface requirements
4. **Code review checklist** for principle adherence

### Code Review Requirements
Every PR must verify:
- [ ] No files exceed 1000 lines
- [ ] No magic strings (all strings are constants)
- [ ] All components have proper TypeScript interfaces
- [ ] Code follows SOLID principles
- [ ] No unnecessary complexity (KISS)
- [ ] No code duplication (DRY)

### Refactoring Guidelines
When refactoring existing code:
1. **Measure first**: Check current file sizes and complexity
2. **Plan breakdown**: Identify logical separation points
3. **Extract gradually**: Don't break everything at once
4. **Test thoroughly**: Ensure functionality remains intact
5. **Update documentation**: Keep docs in sync with changes