# TypeScript Standards

This document defines the TypeScript coding standards and interface requirements for the Airbotix project.

## Interface Requirements

### Mandatory Interface Rule
**Every TypeScript structure must have a proper interface definition**

**Applies to:**
- Component props
- API responses  
- Data structures
- Function parameters (complex objects)
- State objects
- Configuration objects

### Interface vs Type Preference
- **Use `interface`** for object structures
- **Use `type`** for unions, primitives, and computed types

```typescript
// ✅ Good - Use interface for objects
interface WorkshopProps {
  workshop: Workshop
  onSelect: (id: string) => void
}

interface ApiResponse {
  data: unknown
  status: number
  message: string
}

// ✅ Good - Use type for unions and computed types  
type Status = 'loading' | 'success' | 'error'
type ButtonVariant = 'primary' | 'secondary' | 'danger'
type WorkshopKeys = keyof Workshop

// ❌ Bad - Don't use type for simple objects
type WorkshopProps = {
  workshop: Workshop
  onSelect: (id: string) => void
}
```

## Current Codebase Analysis

### Interface Coverage Status
Based on analysis, the project has good interface coverage:

**✅ Properly Interfaced:**
- `src/components/Layout.tsx` - Has LayoutProps interface
- `src/types/index.ts` - Comprehensive interfaces for all major types
- Most components follow proper typing

**⚠️ Needs Improvement:**
- `src/pages/Book.tsx` - Uses inline types instead of interfaces
- Some utility functions lack parameter interfaces

### Missing Interface Patterns

#### 1. Component Props Without Interfaces
```typescript
// ❌ Bad - Found in some files
const ComponentName = ({ prop1, prop2, prop3 }: {
  prop1: string
  prop2: number  
  prop3?: boolean
}) => {
  // Component logic
}

// ✅ Good - Should be
interface ComponentNameProps {
  prop1: string
  prop2: number
  prop3?: boolean
}

const ComponentName = ({ prop1, prop2, prop3 }: ComponentNameProps) => {
  // Component logic
}
```

#### 2. Form Data Without Interfaces
```typescript
// ❌ Bad - Currently in Book.tsx
type BookingForm = {
  workshopId: string
  organization: string
  // ... more fields
}

// ✅ Good - Should be
interface BookingFormData {
  workshopId: string
  organization: string
  contactName: string
  email: string
  phone: string
  preferredDate: string
  location: string
  studentsCount: string
  gradeRange: string
  notes: string
}
```

## Interface Design Principles

### 1. Descriptive Naming
```typescript
// ✅ Good - Clear, descriptive names
interface WorkshopRegistrationForm {
  workshopId: string
  participantDetails: ParticipantDetails
  paymentInfo: PaymentInfo
}

interface ParticipantDetails {
  name: string
  email: string
  age: number
  experience: ExperienceLevel
}

// ❌ Bad - Generic, unclear names
interface Form {
  id: string
  details: any
  info: any
}
```

### 2. Logical Grouping
```typescript
// ✅ Good - Grouped by concern
interface Workshop {
  // Basic info
  id: string
  title: string
  description: string
  
  // Scheduling
  startDate: Date
  endDate: Date
  duration: string
  
  // Participation
  capacity: number
  enrolled: number
  waitlist: number
  
  // Content
  syllabus: SyllabusItem[]
  materials: Material[]
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

// ❌ Bad - Random order
interface Workshop {
  id: string
  createdAt: Date
  title: string
  capacity: number
  description: string
  startDate: Date
  // ... mixed concerns
}
```

### 3. Proper Optional Properties
```typescript
// ✅ Good - Clear optionality
interface WorkshopCardProps {
  workshop: Workshop                    // Required
  showBookButton?: boolean             // Optional with default
  onBookClick?: (id: string) => void   // Optional callback
  className?: string                   // Optional styling
}

// ❌ Bad - Everything optional or required when shouldn't be
interface WorkshopCardProps {
  workshop?: Workshop  // Should be required
  showBookButton: boolean | undefined  // Verbose optional syntax
}
```

### 4. Interface Inheritance
```typescript
// ✅ Good - Logical inheritance
interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

interface Workshop extends BaseEntity {
  title: string
  description: string
  instructor: Instructor
}

interface FeaturedWorkshop extends Workshop {
  featured: true
  featuredReason: string
  featuredImage: string
}

// ❌ Bad - Repeated properties
interface Workshop {
  id: string
  createdAt: Date
  updatedAt: Date
  title: string
  description: string
}

interface FeaturedWorkshop {
  id: string            // Duplicated
  createdAt: Date       // Duplicated  
  updatedAt: Date       // Duplicated
  title: string         // Duplicated
  description: string   // Duplicated
  featured: true
  featuredReason: string
}
```

## Generic Interface Patterns

### 1. API Response Interfaces
```typescript
interface ApiResponse<T> {
  data: T
  status: 'success' | 'error'
  message?: string
  timestamp: Date
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

// Usage
interface WorkshopsResponse extends ApiResponse<Workshop[]> {}
interface WorkshopResponse extends ApiResponse<Workshop> {}
```

### 2. Form Interface Patterns
```typescript
interface FormState<T> {
  data: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isValid: boolean
}

interface FormHandlers<T> {
  handleChange: (field: keyof T, value: T[keyof T]) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  handleReset: () => void
  validate: () => boolean
}

// Usage
interface BookingFormState extends FormState<BookingFormData> {}
interface BookingFormHandlers extends FormHandlers<BookingFormData> {}
```

### 3. Component Prop Patterns
```typescript
// Base component props
interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
  testId?: string
}

// Interactive component props
interface InteractiveProps {
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
}

// Data component props
interface DataComponentProps<T> {
  data: T
  loading?: boolean
  error?: string | null
  onRefetch?: () => void
}

// Usage
interface WorkshopCardProps extends BaseComponentProps, InteractiveProps {
  workshop: Workshop
  variant?: 'compact' | 'detailed'
}
```

## Enforcement Rules

### 1. ESLint Rules
Add these rules to enforce interfaces:
```json
{
  "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/explicit-function-return-type": "warn",
  "@typescript-eslint/prefer-interface": "error"
}
```

### 2. Pre-commit Validation
```bash
# Check for missing interfaces in component files
grep -r "const.*= ({" src/components/ src/pages/ | grep -v ": .*Props" && echo "❌ Components missing prop interfaces found"
```

### 3. Code Review Checklist
For every PR, verify:
- [ ] All component props have named interfaces
- [ ] All API calls have response interfaces
- [ ] All form data has interfaces
- [ ] No `any` types used without justification
- [ ] Interfaces use descriptive names
- [ ] Complex function parameters have interfaces
- [ ] State objects have proper interfaces

## Refactoring Guide

### Converting Types to Interfaces
```typescript
// Before: Using type for objects
type BookingForm = {
  workshopId: string
  organization: string
  contactName: string
}

// After: Using interface
interface BookingFormData {
  workshopId: string
  organization: string
  contactName: string
}
```

### Adding Missing Interfaces
```typescript
// Before: Inline prop types
const WorkshopCard = ({ workshop, onBookClick, isLoading }: {
  workshop: Workshop
  onBookClick: (id: string) => void
  isLoading?: boolean
}) => {
  // Component
}

// After: Proper interface
interface WorkshopCardProps {
  workshop: Workshop
  onBookClick: (id: string) => void
  isLoading?: boolean
}

const WorkshopCard = ({ workshop, onBookClick, isLoading }: WorkshopCardProps) => {
  // Component
}
```

### Interface Organization
```typescript
// Create dedicated interface files for complex domains
// interfaces/workshop.ts
export interface Workshop {
  // Workshop definition
}

export interface WorkshopBooking {
  // Booking definition
}

export interface WorkshopInstructor {
  // Instructor definition
}

// interfaces/index.ts
export * from './workshop'
export * from './user'
export * from './api'
```

## Best Practices Summary

1. **Always define interfaces** for component props
2. **Use descriptive names** that indicate purpose
3. **Group related properties** logically
4. **Leverage inheritance** to avoid duplication
5. **Make optionality explicit** with `?`
6. **Use generics** for reusable patterns
7. **Document complex interfaces** with JSDoc
8. **Validate interfaces** with TypeScript strict mode
9. **Review interfaces** as part of code review process
10. **Refactor gradually** to improve existing code