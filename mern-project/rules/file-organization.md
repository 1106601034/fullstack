# File Organization Rules

This document defines the file organization standards and constraints for the Airbotix project.

## File Size Constraints

### Maximum File Size: 1000 Lines
**Hard Rule**: No TypeScript/TSX file should exceed 1000 lines

**Rationale:**
- **Context Window Limitations**: AI tools have token limits for processing
- **Readability**: Large files are harder to understand and maintain
- **Review Efficiency**: Smaller files are easier to review in PRs
- **Debugging**: Easier to locate issues in focused files

### Enforcement
```bash
# Check for files exceeding 1000 lines
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | awk '$1 > 1000 {print $2 " has " $1 " lines - EXCEEDS LIMIT"}'
```

## Current File Analysis

### Files Requiring Immediate Attention
Based on current analysis:

1. **src/pages/Book.tsx (296 lines)** ✅ Under limit but could be optimized
2. **src/pages/Contact.tsx (211 lines)** ✅ Under limit
3. **src/utils/index.ts (205 lines)** ✅ Under limit but should be broken down
4. **src/pages/Home.tsx (205 lines)** ✅ Under limit
5. **src/data/workshops.ts (201 lines)** ✅ Under limit

All files are currently under the 1000-line limit, but some can be optimized.

## Breakdown Strategies

### Component Breakdown
When a component file approaches the limit:

#### 1. Extract Sub-components
```typescript
// Before: LargeWorkshopPage.tsx (900+ lines)
const WorkshopPage = () => {
  // Hero section (100 lines)
  // Description section (150 lines)
  // Syllabus section (200 lines)
  // Pricing section (100 lines)
  // Booking form (250 lines)
  // Reviews section (150 lines)
}

// After: Split into focused components
// WorkshopPage.tsx (50 lines) - Main orchestrator
// WorkshopHero.tsx (100 lines)
// WorkshopDescription.tsx (150 lines)
// WorkshopSyllabus.tsx (200 lines)
// WorkshopPricing.tsx (100 lines)
// WorkshopBookingForm.tsx (250 lines)
// WorkshopReviews.tsx (150 lines)
```

#### 2. Extract Custom Hooks
```typescript
// Extract state management and logic
// hooks/useWorkshopBooking.ts (150 lines)
// hooks/useWorkshopData.ts (100 lines)
// hooks/useWorkshopValidation.ts (80 lines)
```

#### 3. Extract Utilities
```typescript
// utils/workshop-helpers.ts
export const calculateWorkshopPrice = () => {}
export const formatWorkshopDate = () => {}
export const validateWorkshopForm = () => {}

// utils/workshop-constants.ts
export const WORKSHOP_CONSTANTS = {}
```

### Data File Breakdown
For large data files like `workshops.ts`:

#### 1. Split by Domain
```typescript
// data/workshops/ai-robotics.ts
// data/workshops/robotics-fundamentals.ts
// data/workshops/computer-vision.ts
// data/workshops/index.ts (aggregates all)
```

#### 2. Separate Configuration
```typescript
// data/workshop-config.ts - Configuration constants
// data/workshop-types.ts - TypeScript interfaces
// data/workshop-data.ts - Actual data
```

### Utility File Breakdown
For large utility files:

#### 1. Functional Grouping
```typescript
// utils/date-helpers.ts
// utils/form-validation.ts
// utils/api-helpers.ts
// utils/string-helpers.ts
// utils/workshop-helpers.ts
```

#### 2. Feature-based Organization
```typescript
// utils/workshop/
//   ├── pricing.ts
//   ├── validation.ts
//   ├── formatting.ts
//   └── index.ts
```

## Directory Structure Rules

### Component Organization
```
src/
├── components/
│   ├── ui/                 # Generic UI components (<200 lines each)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── layout/             # Layout components (<300 lines each)
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   └── features/           # Feature-specific components (<500 lines each)
│       ├── workshop/
│       ├── booking/
│       └── contact/
├── pages/                  # Page components (<400 lines each)
├── hooks/                  # Custom hooks (<200 lines each)
├── utils/                  # Utility functions (<300 lines each)
├── constants/              # Constants and configuration (<200 lines each)
├── types/                  # TypeScript definitions (<300 lines each)
└── data/                   # Data files (<500 lines each)
```

### File Naming Conventions
- **Components**: PascalCase.tsx (e.g., `WorkshopCard.tsx`)
- **Hooks**: camelCase.ts starting with 'use' (e.g., `useWorkshopData.ts`)
- **Utils**: kebab-case.ts (e.g., `form-validation.ts`)
- **Constants**: kebab-case.ts (e.g., `api-endpoints.ts`)
- **Types**: kebab-case.ts (e.g., `workshop-types.ts`)

## Refactoring Process

### Step-by-Step Breakdown Process

#### 1. Analysis Phase
```bash
# Measure current file size
wc -l src/components/LargeComponent.tsx

# Identify logical sections
# - State declarations
# - Effect hooks  
# - Event handlers
# - Render sections
# - Helper functions
```

#### 2. Planning Phase
- Identify single-responsibility components
- Plan extraction order (least dependent first)
- Define interfaces for extracted components
- Plan file structure

#### 3. Extraction Phase
```typescript
// Step 1: Extract simple sub-components first
const ComponentHeader = ({ title, subtitle }: HeaderProps) => (
  <div>
    <h1>{title}</h1>
    <p>{subtitle}</p>
  </div>
)

// Step 2: Extract complex sections
const ComponentForm = ({ onSubmit, initialData }: FormProps) => {
  // Extracted form logic
}

// Step 3: Extract custom hooks
const useComponentData = () => {
  // Extracted state and effects
}
```

#### 4. Integration Phase
```typescript
// Main component becomes orchestrator
const MainComponent = () => {
  const { data, loading } = useComponentData()
  
  return (
    <>
      <ComponentHeader title="Title" subtitle="Subtitle" />
      <ComponentForm onSubmit={handleSubmit} initialData={data} />
    </>
  )
}
```

### Testing After Breakdown
1. **Functional Testing**: Ensure all features work as before
2. **Performance Testing**: Check for any performance regressions
3. **Bundle Size**: Verify bundle size hasn't increased significantly
4. **Type Safety**: Ensure all TypeScript interfaces are correct

## Monitoring and Maintenance

### Pre-commit Hooks
```bash
#!/bin/bash
# .git/hooks/pre-commit
echo "Checking file sizes..."
oversized_files=$(find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | awk '$1 > 1000 {print $2}')
if [ ! -z "$oversized_files" ]; then
  echo "❌ Files exceeding 1000 lines found:"
  echo "$oversized_files"
  exit 1
fi
echo "✅ All files within size limits"
```

### Regular Reviews
- **Weekly**: Check for files approaching 800 lines
- **Monthly**: Review overall project structure
- **Per PR**: Verify no new oversized files introduced

### Metrics to Track
- Average file size per directory
- Number of files approaching size limit
- Component complexity metrics
- Bundle size impact of file organization