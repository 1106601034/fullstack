# Error Handling Standards

**Priority: 🔴 CRITICAL**
**Applies to: ALL code**

## Core Principle
Errors are not exceptional - they are expected. Plan for failure, handle it gracefully.

## Error Handling Strategy

### 1. Fail Fast
**Rule**: Detect errors as early as possible.

#### ✅ Good Example
```typescript
// Validate immediately
const processPayment = (amount: number, card: CreditCard) => {
  // Fail fast with validation
  if (amount <= 0) {
    throw new Error('Payment amount must be positive')
  }

  if (!isValidCard(card)) {
    throw new Error('Invalid credit card')
  }

  // Proceed with valid data
  return chargeCard(card, amount)
}
```

#### ❌ Bad Example
```typescript
// Late validation = wasted work
const processPayment = (amount: number, card: CreditCard) => {
  const transaction = createTransaction()
  const invoice = generateInvoice()
  const receipt = prepareReceipt()

  // Too late to validate!
  if (amount <= 0) {
    throw new Error('Invalid amount')
  }
}
```

### 2. Explicit Error Handling
**Rule**: Make error handling visible and explicit.

#### ✅ Good Example
```typescript
// Explicit error types
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

const fetchUser = async (id: string): Promise<Result<User>> => {
  try {
    const user = await api.get(`/users/${id}`)
    return { success: true, data: user }
  } catch (error) {
    return { success: false, error }
  }
}

// Usage makes error handling explicit
const result = await fetchUser(userId)
if (!result.success) {
  console.error('Failed to fetch user:', result.error)
  return
}
// TypeScript knows result.data exists here
console.log(result.data.name)
```

#### ❌ Bad Example
```typescript
// Hidden error handling
const fetchUser = async (id: string) => {
  try {
    return await api.get(`/users/${id}`)
  } catch {
    return null  // Error swallowed, caller doesn't know why
  }
}

// Caller has no idea if null means error or no user
const user = await fetchUser(userId)
if (!user) {
  // Was it an error? User not found? Network issue?
}
```

## Error Types and Handling

### Application Errors
**Rule**: Create specific error types for different scenarios.

```typescript
// ✅ Good: Specific error types
class ValidationError extends Error {
  constructor(public field: string, public value: any) {
    super(`Invalid value for ${field}: ${value}`)
    this.name = 'ValidationError'
  }
}

class AuthenticationError extends Error {
  constructor(message = 'Authentication failed') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

class NetworkError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

// Usage
const validateEmail = (email: string) => {
  if (!email.includes('@')) {
    throw new ValidationError('email', email)
  }
}

// Specific handling
try {
  validateEmail(userInput)
} catch (error) {
  if (error instanceof ValidationError) {
    showFieldError(error.field, error.message)
  } else if (error instanceof NetworkError) {
    showNetworkError(error.statusCode)
  } else {
    showGenericError(error)
  }
}
```

### Network Errors
**Rule**: Always handle network failures gracefully.

```typescript
// ✅ Good: Comprehensive network error handling
const apiCall = async <T>(
  url: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string }> => {
  try {
    const response = await fetch(url, {
      ...options,
      timeout: 5000  // Always set timeout
    })

    if (!response.ok) {
      // Handle HTTP errors
      if (response.status === 404) {
        return { error: 'Resource not found' }
      }
      if (response.status === 401) {
        return { error: 'Unauthorized' }
      }
      if (response.status >= 500) {
        return { error: 'Server error, please try again later' }
      }
      return { error: `Request failed: ${response.status}` }
    }

    const data = await response.json()
    return { data }

  } catch (error) {
    // Handle network errors
    if (error.name === 'AbortError') {
      return { error: 'Request timeout' }
    }
    if (error.name === 'TypeError') {
      return { error: 'Network connection failed' }
    }
    return { error: 'An unexpected error occurred' }
  }
}
```

## React Error Handling

### Error Boundaries
**Rule**: Wrap components with error boundaries.

```typescript
// ✅ Good: Error boundary implementation
class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service
    console.error('Component error:', error, errorInfo)
    logErrorToService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ hasError: false })}
        />
      )
    }

    return this.props.children
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Async Error Handling in Components
```typescript
// ✅ Good: Proper async error handling
const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadUser = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchUser()

        if (!cancelled) {
          setUser(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load user')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadUser()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <Spinner />
  if (error) return <ErrorMessage message={error} />
  if (!user) return <NotFound />

  return <UserDetails user={user} />
}
```

## Backend Error Handling

### API Error Responses
**Rule**: Return consistent error structures.

```typescript
// ✅ Good: Consistent error format
interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: string
  path: string
}

const errorHandler = (err: Error, req: Request, res: Response) => {
  const error: ApiError = {
    code: err.name || 'UNKNOWN_ERROR',
    message: err.message || 'An error occurred',
    timestamp: new Date().toISOString(),
    path: req.path
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      ...error,
      code: 'VALIDATION_ERROR',
      details: err.validationErrors
    })
  }

  if (err instanceof AuthenticationError) {
    return res.status(401).json({
      ...error,
      code: 'AUTH_ERROR'
    })
  }

  // Don't leak internal errors in production
  if (process.env.NODE_ENV === 'production') {
    error.message = 'Internal server error'
  }

  res.status(500).json(error)
}
```

### Database Error Handling
```typescript
// ✅ Good: Database error handling
const createUser = async (userData: UserData): Promise<User> => {
  const connection = await getConnection()

  try {
    await connection.beginTransaction()

    const user = await connection.query(
      'INSERT INTO users SET ?',
      userData
    )

    await connection.commit()
    return user

  } catch (error) {
    await connection.rollback()

    if (error.code === 'ER_DUP_ENTRY') {
      throw new ValidationError('email', 'Email already exists')
    }

    if (error.code === 'ER_DATA_TOO_LONG') {
      throw new ValidationError('data', 'Input data too long')
    }

    // Log unexpected errors
    console.error('Database error:', error)
    throw new Error('Failed to create user')

  } finally {
    connection.release()
  }
}
```

## Error Recovery Strategies

### Retry Logic
```typescript
// ✅ Good: Exponential backoff retry
const withRetry = async <T>(
  fn: () => Promise<T>,
  options = { maxAttempts: 3, delay: 1000 }
): Promise<T> => {
  let lastError: Error

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt === options.maxAttempts) {
        throw lastError
      }

      // Exponential backoff
      const delay = options.delay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))

      console.log(`Retry attempt ${attempt} after ${delay}ms`)
    }
  }

  throw lastError!
}

// Usage
const data = await withRetry(() => fetchCriticalData())
```

### Fallback Strategies
```typescript
// ✅ Good: Graceful degradation
const getUserPreferences = async (userId: string): Promise<Preferences> => {
  try {
    // Try to get from primary source
    return await fetchFromDatabase(userId)
  } catch (dbError) {
    console.warn('Database unavailable, trying cache', dbError)

    try {
      // Fall back to cache
      return await fetchFromCache(userId)
    } catch (cacheError) {
      console.warn('Cache unavailable, using defaults', cacheError)

      // Final fallback to defaults
      return getDefaultPreferences()
    }
  }
}
```

## Logging and Monitoring

### Error Logging
```typescript
// ✅ Good: Structured error logging
const logError = (
  context: string,
  error: Error,
  metadata?: Record<string, any>
) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    level: 'error',
    context,
    message: error.message,
    stack: error.stack,
    metadata,
    environment: process.env.NODE_ENV
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(errorLog)
  }

  // Send to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    sendToMonitoring(errorLog)
  }

  // Write to file
  writeToLogFile(errorLog)
}

// Usage
try {
  await processOrder(order)
} catch (error) {
  logError('orderProcessing', error, {
    orderId: order.id,
    userId: order.userId,
    amount: order.amount
  })
  throw error
}
```

## Error Prevention

### Input Validation
```typescript
// ✅ Good: Validate early and thoroughly
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  age: z.number().min(13).max(120),
  name: z.string().min(1).max(100)
})

const createUser = async (input: unknown) => {
  // Validate input
  const result = createUserSchema.safeParse(input)

  if (!result.success) {
    throw new ValidationError('input', result.error.issues)
  }

  // Proceed with validated data
  return await saveUser(result.data)
}
```

### Type Safety
```typescript
// ✅ Good: Use TypeScript to prevent errors
// Exhaustive type checking
type Status = 'pending' | 'approved' | 'rejected'

const handleStatus = (status: Status) => {
  switch (status) {
    case 'pending':
      return processPending()
    case 'approved':
      return processApproved()
    case 'rejected':
      return processRejected()
    default:
      // TypeScript ensures this is never reached
      const exhaustive: never = status
      throw new Error(`Unhandled status: ${exhaustive}`)
  }
}
```

## Error Handling Checklist

- [ ] All async operations have try-catch blocks
- [ ] Network requests have timeout settings
- [ ] Error messages are user-friendly
- [ ] Sensitive information is not exposed in errors
- [ ] Errors are logged with context
- [ ] Critical operations have retry logic
- [ ] Components have error boundaries
- [ ] API returns consistent error formats
- [ ] Database transactions have rollback logic
- [ ] Input validation happens early

## Anti-Patterns to Avoid

### 1. Silent Failures
```typescript
// ❌ Bad: Swallowing errors
try {
  await doSomething()
} catch {
  // Error ignored!
}
```

### 2. Generic Catch-All
```typescript
// ❌ Bad: Losing error context
catch (error) {
  throw new Error('Something went wrong')  // Original error lost
}
```

### 3. Using Errors for Control Flow
```typescript
// ❌ Bad: Exceptions for normal flow
const getUser = (id: string) => {
  if (!users[id]) {
    throw new Error('User not found')  // Not exceptional!
  }
  return users[id]
}
```

### 4. Inconsistent Error Handling
```typescript
// ❌ Bad: Different patterns everywhere
// Some functions throw
const fn1 = () => { throw new Error() }
// Some return null
const fn2 = () => { return null }
// Some return error objects
const fn3 = () => { return { error: true } }
```

## Remember

- Errors are **inevitable** - plan for them
- Fail **fast** and **loud** in development
- Fail **gracefully** in production
- **Log** everything, **expose** nothing
- Make the **impossible** states **unrepresentable**