# String Constants Rules

This document defines the mandatory rules for string constant usage in the Airbotix project.

## Core Rule: No Magic Strings

**Fundamental Principle**: All strings in the codebase must be defined as named constants, never as inline literals.

**Rationale:**
- **Maintainability**: Centralized string management
- **Consistency**: Same strings used across components  
- **Internationalization**: Easy to replace with translation keys
- **Refactoring Safety**: IDE can find all usages
- **Type Safety**: Constants can be typed for better validation

## Current Violations

Based on codebase analysis, all TypeScript files contain string literals that need to be converted to constants.

### Examples of Current Violations
```typescript
// ❌ Bad - Magic strings found in codebase
const workshopType = 'ai-robotics-beginners'
const errorMessage = 'Please enter a valid email address'
const apiUrl = '/api/workshops'
const className = 'bg-blue-500 hover:bg-blue-600'
```

## Constant Organization Strategy

### 1. File-Level Constants
For strings used within a single file:

```typescript
// ✅ Good - File-level constants
const FORM_FIELDS = {
  WORKSHOP_ID: 'workshopId',
  ORGANIZATION: 'organization', 
  CONTACT_NAME: 'contactName',
  EMAIL: 'email',
} as const

const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  BOOKING_FAILED: 'Workshop booking failed. Please try again.',
} as const

const CSS_CLASSES = {
  PRIMARY_BUTTON: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded',
  ERROR_TEXT: 'text-red-600 text-sm mt-1',
  SUCCESS_TEXT: 'text-green-600 text-sm mt-1',
} as const

// Usage in component
const handleSubmit = () => {
  if (!form[FORM_FIELDS.EMAIL]) {
    setError(ERROR_MESSAGES.REQUIRED_FIELD)
  }
}
```

### 2. Module-Level Constants
For strings shared across multiple files in a feature:

```typescript
// constants/workshop.ts
export const WORKSHOP_TYPES = {
  AI_ROBOTICS: 'ai-robotics-beginners',
  ROBOTICS_FUNDAMENTALS: 'robotics-fundamentals', 
  COMPUTER_VISION: 'computer-vision-makers',
} as const

export const WORKSHOP_DURATIONS = {
  SHORT: '6 weeks',
  MEDIUM: '8 weeks', 
  LONG: '12 weeks',
} as const

export const WORKSHOP_STATUS = {
  AVAILABLE: 'available',
  FULL: 'full',
  COMING_SOON: 'coming-soon',
  CANCELLED: 'cancelled',
} as const
```

### 3. Global Constants
For strings used across the entire application:

```typescript
// constants/global.ts
export const API_ENDPOINTS = {
  WORKSHOPS: '/api/workshops',
  BOOKINGS: '/api/bookings',
  CONTACT: '/api/contact',
  INSTRUCTORS: '/api/instructors',
} as const

export const ROUTES = {
  HOME: '/',
  WORKSHOPS: '/workshops',
  ABOUT: '/about',
  CONTACT: '/contact',
  BOOK: '/book',
} as const

export const APP_CONFIG = {
  SITE_NAME: 'Airbotix',
  SITE_DESCRIPTION: 'AI and Robotics Education for K-12 Students',
  DEFAULT_PAGE_SIZE: 20,
  MAX_UPLOAD_SIZE: 5242880, // 5MB in bytes
} as const
```

### 4. UI/Styling Constants
For CSS classes and UI-related strings:

```typescript
// constants/styles.ts  
export const TAILWIND_CLASSES = {
  BUTTONS: {
    PRIMARY: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200',
    SECONDARY: 'bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200',
    DANGER: 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200',
  },
  CARDS: {
    DEFAULT: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6',
    ELEVATED: 'bg-white rounded-lg shadow-lg border border-gray-200 p-6',
  },
  TEXT: {
    HEADING: 'text-3xl font-bold text-gray-900',
    SUBHEADING: 'text-xl font-semibold text-gray-800',
    BODY: 'text-gray-700 leading-relaxed',
    ERROR: 'text-red-600 text-sm',
    SUCCESS: 'text-green-600 text-sm',
  },
} as const

export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px', 
  LG: '1024px',
  XL: '1280px',
} as const
```

## String Categorization

### 1. User-Facing Messages
```typescript
// constants/messages.ts
export const USER_MESSAGES = {
  SUCCESS: {
    BOOKING_SUBMITTED: 'Your workshop booking has been submitted successfully!',
    CONTACT_SENT: 'Your message has been sent. We\'ll get back to you soon!',
    REGISTRATION_COMPLETE: 'Registration completed successfully!',
  },
  ERRORS: {
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    VALIDATION_FAILED: 'Please correct the errors below and try again.',
    BOOKING_FAILED: 'Unable to submit booking. Please try again later.',
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PHONE: 'Please enter a valid phone number',
  },
  LOADING: {
    SUBMITTING: 'Submitting...',
    LOADING_WORKSHOPS: 'Loading workshops...',
    PROCESSING: 'Processing your request...',
  },
} as const
```

### 2. Technical/System Strings
```typescript
// constants/system.ts
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const

export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
} as const

export const LOCAL_STORAGE_KEYS = {
  USER_PREFERENCES: 'airbotix_user_preferences',
  WORKSHOP_FILTERS: 'airbotix_workshop_filters',
  BOOKING_DRAFT: 'airbotix_booking_draft',
} as const
```

### 3. Business Logic Strings
```typescript
// constants/business.ts
export const WORKSHOP_CAPACITY = {
  SMALL: 10,
  MEDIUM: 20,
  LARGE: 30,
} as const

export const AGE_GROUPS = {
  ELEMENTARY: '6-11 years',
  MIDDLE_SCHOOL: '12-14 years',
  HIGH_SCHOOL: '15-18 years',
} as const

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate', 
  ADVANCED: 'advanced',
} as const
```

## Implementation Guidelines

### 1. Constant Naming Conventions
```typescript
// ✅ Good - Descriptive, hierarchical naming
const WORKSHOP_BOOKING_FORM = {
  FIELDS: {
    ORGANIZATION_NAME: 'organizationName',
    CONTACT_EMAIL: 'contactEmail',
    STUDENT_COUNT: 'studentCount',
  },
  VALIDATION: {
    MIN_STUDENTS: 5,
    MAX_STUDENTS: 50,
  },
} as const

// ❌ Bad - Generic, flat naming
const FORM = {
  NAME: 'name',
  EMAIL: 'email',
  MIN: 5,
  MAX: 50,
}
```

### 2. Type Safety with Constants
```typescript
// ✅ Good - Typed constants
export const WORKSHOP_TYPES = {
  AI_ROBOTICS: 'ai-robotics-beginners',
  ROBOTICS_FUNDAMENTALS: 'robotics-fundamentals',
  COMPUTER_VISION: 'computer-vision-makers',
} as const

export type WorkshopType = typeof WORKSHOP_TYPES[keyof typeof WORKSHOP_TYPES]

// Usage with type safety
interface WorkshopProps {
  type: WorkshopType  // Only allows valid workshop types
}
```

### 3. Environment-Specific Constants
```typescript
// constants/environment.ts
const isDevelopment = import.meta.env.DEV

export const ENV_CONFIG = {
  API_BASE_URL: isDevelopment 
    ? 'http://localhost:3000/api' 
    : 'https://api.airbotix.com',
  ENABLE_DEBUG: isDevelopment,
  ANALYTICS_ID: import.meta.env.VITE_ANALYTICS_ID || '',
} as const
```

## Refactoring Process

### Step 1: Identify Magic Strings
```bash
# Find all string literals in TypeScript files
grep -r '"[^"]*"' src/ --include="*.ts" --include="*.tsx" | grep -v "import\|export\|console"
```

### Step 2: Categorize Strings
Group found strings into categories:
- User messages
- API endpoints  
- CSS classes
- Configuration values
- Business logic values

### Step 3: Create Constant Files
```typescript
// Create organized constant files
constants/
├── api.ts          // API endpoints and HTTP constants
├── business.ts     // Business logic constants
├── messages.ts     // User-facing messages
├── routes.ts       // Application routes
├── styles.ts       // CSS classes and styling
├── system.ts       // Technical/system constants
└── index.ts        // Re-export all constants
```

### Step 4: Replace Gradually
```typescript
// Before refactoring
const submitBooking = async () => {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  if (response.ok) {
    setMessage('Booking submitted successfully!')
  } else {
    setError('Failed to submit booking')
  }
}

// After refactoring
import { API_ENDPOINTS, HTTP_METHODS, CONTENT_TYPES } from '../constants/api'
import { USER_MESSAGES } from '../constants/messages'

const submitBooking = async () => {
  const response = await fetch(API_ENDPOINTS.BOOKINGS, {
    method: HTTP_METHODS.POST,
    headers: {
      'Content-Type': CONTENT_TYPES.JSON
    }
  })
  
  if (response.ok) {
    setMessage(USER_MESSAGES.SUCCESS.BOOKING_SUBMITTED)
  } else {
    setError(USER_MESSAGES.ERRORS.BOOKING_FAILED)
  }
}
```

## Enforcement

### 1. ESLint Rule
```json
{
  "rules": {
    "no-magic-numbers": ["error", { "ignore": [0, 1, -1] }],
    "@typescript-eslint/prefer-literal-enum-member": "error"
  }
}
```

### 2. Custom Linting Rule
Create custom rule to detect string literals:
```javascript
// eslint-rules/no-magic-strings.js
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "disallow magic string literals"
    }
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value === "string" && node.value.length > 3) {
          context.report({
            node,
            message: "Replace magic string with named constant"
          })
        }
      }
    }
  }
}
```

### 3. Pre-commit Hook
```bash
#!/bin/bash
echo "Checking for magic strings..."
magic_strings=$(grep -r '"[a-zA-Z].*"' src/ --include="*.ts" --include="*.tsx" | grep -v "import\|export\|const.*=" | wc -l)
if [ "$magic_strings" -gt 0 ]; then
  echo "❌ Magic strings found. All strings must be constants."
  exit 1
fi
echo "✅ No magic strings detected"
```

## Benefits Summary

1. **Maintainability**: Single source of truth for strings
2. **Type Safety**: Constants can be typed and validated
3. **Refactoring**: IDE can find and replace all usages
4. **Consistency**: Same strings used everywhere
5. **Internationalization**: Easy to replace with translation keys
6. **Performance**: String constants are optimized by bundlers
7. **Code Review**: Easier to spot string-related issues