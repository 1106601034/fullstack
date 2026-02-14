# DRY (Don't Repeat Yourself) Principle

**Priority: 🔴 CRITICAL**
**Applies to: ALL code**

## Core Rule
Every piece of knowledge must have a single, unambiguous, authoritative representation within a system.

## What DRY Really Means

DRY is NOT just about code duplication. It's about:
- **Knowledge duplication** - Same business logic in multiple places
- **Data duplication** - Same data structured differently
- **Process duplication** - Same workflow implemented multiple times

## Types of Duplication to Eliminate

### 1. Code Duplication
**Rule**: If you write the same code twice, extract it.

#### ✅ Good Example
```typescript
// Extracted common logic
const calculateDiscount = (price: number, discountPercent: number): number => {
  return price * (1 - discountPercent / 100)
}

const applyStudentDiscount = (price: number) => calculateDiscount(price, 20)
const applyMemberDiscount = (price: number) => calculateDiscount(price, 15)
```

#### ❌ Bad Example
```typescript
// Duplicated calculation logic
const applyStudentDiscount = (price: number) => {
  return price * 0.8 // 20% off
}

const applyMemberDiscount = (price: number) => {
  return price * 0.85 // 15% off
}
```

### 2. Data Structure Duplication
**Rule**: Define data structures once, reuse everywhere.

#### ✅ Good Example
```typescript
// Single source of truth
interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

// Reuse and extend
interface UserProfile extends User {
  bio: string
  avatar: string
}

type UserSummary = Pick<User, 'id' | 'name'>
```

#### ❌ Bad Example
```typescript
// Multiple definitions of same concept
interface User {
  userId: string
  userEmail: string
}

interface Profile {
  id: string
  email: string
  profileName: string
}

// Same data, different shapes = maintenance nightmare
```

### 3. Business Logic Duplication
**Rule**: Business rules must exist in ONE place only.

#### ✅ Good Example
```typescript
// Centralized validation
class EmailValidator {
  static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  static readonly MAX_LENGTH = 255

  static validate(email: string): ValidationResult {
    if (!email) return { valid: false, error: 'Email required' }
    if (email.length > this.MAX_LENGTH) return { valid: false, error: 'Email too long' }
    if (!this.EMAIL_REGEX.test(email)) return { valid: false, error: 'Invalid email format' }
    return { valid: true }
  }
}

// Use everywhere
const isValidEmail = (email: string) => EmailValidator.validate(email).valid
```

#### ❌ Bad Example
```typescript
// Validation logic scattered
function validateLoginEmail(email: string) {
  return email && email.includes('@') && email.length < 255
}

function validateSignupEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email) && email.length <= 255
}

// Different validation in different places = bugs
```

### 4. String/Constant Duplication
**Rule**: ALL strings and constants must be defined once.

#### ✅ Good Example
```typescript
// constants/api.ts
export const API_ENDPOINTS = {
  USERS: '/api/users',
  POSTS: '/api/posts',
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
  }
} as const

// constants/messages.ts
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network request failed. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION_FAILED: 'Please check your input and try again.'
} as const

// Use throughout the app
import { API_ENDPOINTS, ERROR_MESSAGES } from '@/constants'
```

#### ❌ Bad Example
```typescript
// Strings scattered everywhere
fetch('/api/users')
// ... in another file
axios.get('/api/users')
// ... in yet another file
const url = '/api/users'

// Error messages duplicated
catch(e) {
  return 'Network request failed. Please try again.'
}
// ... elsewhere
throw new Error('Network request failed. Please try again.')
```

## React-Specific DRY Patterns

### 1. Component Composition
```typescript
// ✅ Good: Reusable components
const Card = ({ children, className = '' }) => (
  <div className={`rounded-lg shadow-md p-4 ${className}`}>
    {children}
  </div>
)

const UserCard = ({ user }) => (
  <Card className="border-blue-200">
    <h3>{user.name}</h3>
  </Card>
)

const PostCard = ({ post }) => (
  <Card className="border-green-200">
    <h2>{post.title}</h2>
  </Card>
)
```

### 2. Custom Hooks
```typescript
// ✅ Good: Extract common logic
const useFetch = <T>(url: string) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url)
        const json = await response.json()
        setData(json)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [url])

  return { data, loading, error }
}

// Reuse everywhere
const { data: users } = useFetch<User[]>('/api/users')
const { data: posts } = useFetch<Post[]>('/api/posts')
```

### 3. Utility Functions
```typescript
// ✅ Good: Common utilities
// utils/format.ts
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US').format(date)
}

// Use throughout
import { formatCurrency, formatDate } from '@/utils/format'
```

## Database/Backend DRY Patterns

### 1. Query Builders
```typescript
// ✅ Good: Reusable query patterns
class BaseRepository<T> {
  protected tableName: string

  async findById(id: string): Promise<T> {
    return db.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id])
  }

  async findAll(limit = 100): Promise<T[]> {
    return db.query(`SELECT * FROM ${this.tableName} LIMIT $1`, [limit])
  }

  async deleteById(id: string): Promise<void> {
    return db.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id])
  }
}

class UserRepository extends BaseRepository<User> {
  tableName = 'users'
}
```

### 2. Middleware
```typescript
// ✅ Good: Reusable middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const user = await verifyToken(token)
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Apply to multiple routes
app.get('/api/profile', authenticate, getProfile)
app.post('/api/posts', authenticate, createPost)
```

## When NOT to Apply DRY

### Accidental Duplication
Don't combine things that happen to look similar but serve different purposes:

```typescript
// ❌ Bad: These serve different purposes, don't combine
const validateAge = (age: number) => age >= 18 && age <= 120
const validatePrice = (price: number) => price >= 0 && price <= 1000000

// ✅ Good: Keep separate when business logic differs
const isAdult = (age: number) => age >= 18
const isValidPrice = (price: number) => price >= 0 && price <= MAX_PRICE
```

## DRY Checklist

Before committing code, verify:

- [ ] No copied code blocks (> 3 lines)
- [ ] Constants defined in one place
- [ ] Business logic centralized
- [ ] Common patterns extracted to utilities
- [ ] Data structures defined once
- [ ] API endpoints in constants
- [ ] Error messages in constants
- [ ] Validation rules centralized
- [ ] Common UI patterns componentized
- [ ] Database queries use repositories/services

## Refactoring to DRY

When you find duplication:

1. **Identify** the duplicated knowledge
2. **Extract** to a function/component/constant
3. **Name** it clearly
4. **Replace** all duplications
5. **Test** all affected areas

## Signs of DRY Violations

- Changing a feature requires editing multiple files
- Same bug appears in multiple places
- Copy-pasting code between files
- Find-and-replace needed for simple changes
- Similar looking functions/components everywhere

## Remember

DRY is about reducing knowledge duplication, not just code duplication. Sometimes a little code duplication is better than the wrong abstraction. Apply DRY pragmatically, not dogmatically.