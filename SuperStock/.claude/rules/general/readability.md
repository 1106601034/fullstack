# Code Readability Standards

**Priority: 🔴 CRITICAL**
**Applies to: ALL code**

## Core Principle
Code is written once but read hundreds of times. Optimize for reading, not writing.

## The Readability Test
If a developer can't understand your code in 30 seconds, it's not readable enough.

## Naming Conventions

### Variables
**Rule**: Names must clearly indicate purpose and content.

#### ✅ Good Examples
```typescript
// Clear, descriptive names
const userEmail = 'john@example.com'
const isLoggedIn = true
const maxRetryCount = 3
const selectedProducts = [product1, product2]
const hasPermission = checkUserPermission(user)
const totalPriceInCents = 9999
```

#### ❌ Bad Examples
```typescript
// Unclear, abbreviated, or misleading
const e = 'john@example.com'  // What is 'e'?
const flag = true              // What flag?
const n = 3                    // What number?
const data = [product1]        // Too generic
const temp = checkPermission() // Temporary what?
const amt = 9999               // Amount of what? What unit?
```

### Functions
**Rule**: Function names must describe what they do, not how.

#### ✅ Good Examples
```typescript
// Action-oriented, clear purpose
const getUserById = (id: string): User => { }
const calculateDiscount = (price: number, percentage: number): number => { }
const sendWelcomeEmail = async (user: User): Promise<void> => { }
const isValidEmail = (email: string): boolean => { }
const formatCurrency = (cents: number): string => { }
```

#### ❌ Bad Examples
```typescript
// Vague, unclear, or implementation-focused
const process = (id: string) => { }              // Process what?
const doStuff = (data: any) => { }              // What stuff?
const handleData = (x: number, y: number) => { } // Handle how?
const check = (email: string) => { }            // Check what?
const util = (value: number) => { }             // Utility for what?
```

### Classes and Interfaces
**Rule**: Use nouns that represent the entity or concept.

#### ✅ Good Examples
```typescript
class UserRepository { }
class EmailValidator { }
class ShoppingCart { }

interface UserProfile { }
interface PaymentGateway { }
interface DatabaseConnection { }
```

#### ❌ Bad Examples
```typescript
class UserManager { }    // Manager is vague
class Helper { }         // Too generic
class Util { }          // Meaningless

interface Data { }       // Too generic
interface Object { }     // Reserved word
interface Thing { }      // What thing?
```

## Code Organization

### File Structure
**Rule**: Related code should be grouped logically.

#### ✅ Good Example
```typescript
// user.service.ts - Logical grouping
import { dependencies } from './dependencies'

// Types at the top
interface UserData { }
interface UserResponse { }

// Constants
const MAX_LOGIN_ATTEMPTS = 3
const SESSION_TIMEOUT = 3600

// Main class/function
export class UserService {
  // Public methods first
  public getUser(id: string) { }
  public updateUser(data: UserData) { }

  // Private methods last
  private validateUser(user: User) { }
  private hashPassword(password: string) { }
}

// Helpers at the bottom
function formatUserResponse(user: User): UserResponse { }
```

### Function Length
**Rule**: Functions should fit on a single screen (< 20-30 lines).

#### ✅ Good Example
```typescript
// Short, focused function
const processOrder = async (order: Order): Promise<OrderResult> => {
  validateOrder(order)

  const payment = await processPayment(order.payment)
  const shipping = await scheduleShipping(order.items)

  await notifyCustomer(order.customer, { payment, shipping })

  return {
    orderId: order.id,
    status: 'processed',
    trackingNumber: shipping.trackingNumber
  }
}
```

#### ❌ Bad Example
```typescript
// Too long, doing too much
const processOrder = async (order: Order) => {
  // 100+ lines of validation logic
  // Payment processing logic
  // Inventory management
  // Shipping calculation
  // Email sending
  // Database updates
  // Logging
  // Error handling
  // ... continues for 200+ lines
}
```

## Formatting Standards

### Indentation and Spacing
**Rule**: Consistent indentation and logical spacing.

#### ✅ Good Example
```typescript
const UserCard = ({ user }: UserCardProps) => {
  const { name, email, role } = user

  if (!user.isActive) {
    return <InactiveUserCard user={user} />
  }

  return (
    <Card>
      <CardHeader>
        <h2>{name}</h2>
        <Badge>{role}</Badge>
      </CardHeader>

      <CardBody>
        <p>{email}</p>
      </CardBody>

      <CardFooter>
        <Button onClick={() => handleEdit(user)}>
          Edit
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### Line Length
**Rule**: Maximum 100 characters per line (80 preferred).

#### ✅ Good Example
```typescript
// Breaking long lines appropriately
const result = await fetchUserData(
  userId,
  { includeProfile: true, includeSettings: true }
)

const message = `Welcome ${user.name},
  your account has been successfully created.`

return (
  <Button
    onClick={handleClick}
    disabled={isLoading || !isValid}
    className="primary-button"
  >
    Submit Form
  </Button>
)
```

## Comments and Documentation

### When to Comment
**Rule**: Comment WHY, not WHAT.

#### ✅ Good Examples
```typescript
// Calculate in cents to avoid floating point precision issues
const totalCents = Math.round(price * 100)

// Using recursion here because the data structure is deeply nested
// and unknown depth
const flattenData = (data: NestedData): FlatData => { }

// Debounce search to avoid excessive API calls
const debouncedSearch = debounce(searchUsers, 300)

// Legacy API requires this specific date format
const formattedDate = date.toISOString().split('T')[0]
```

#### ❌ Bad Examples
```typescript
// Get user by id
const getUserById = (id: string) => { }

// Set count to 0
let count = 0

// Loop through array
for (const item of items) { }

// Return true if valid
return isValid
```

### Function Documentation
**Rule**: Document complex functions with JSDoc.

#### ✅ Good Example
```typescript
/**
 * Calculates compound interest with monthly contributions
 * @param principal - Initial investment amount in dollars
 * @param rate - Annual interest rate as decimal (e.g., 0.07 for 7%)
 * @param years - Investment period in years
 * @param monthlyContribution - Optional monthly contribution in dollars
 * @returns Total value after the investment period
 */
const calculateCompoundInterest = (
  principal: number,
  rate: number,
  years: number,
  monthlyContribution = 0
): number => {
  // Implementation
}
```

## Consistency Patterns

### Consistent Patterns
**Rule**: Use the same pattern throughout the codebase.

#### ✅ Good Example
```typescript
// Consistent error handling pattern
const fetchUser = async (id: string): Promise<User | null> => {
  try {
    const response = await api.get(`/users/${id}`)
    return response.data
  } catch (error) {
    logError('fetchUser', error)
    return null
  }
}

const fetchPosts = async (userId: string): Promise<Post[] | null> => {
  try {
    const response = await api.get(`/posts?userId=${userId}`)
    return response.data
  } catch (error) {
    logError('fetchPosts', error)
    return null
  }
}
```

### Consistent Return Types
**Rule**: Functions should have predictable return types.

#### ✅ Good Example
```typescript
// Always returns the same shape
interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}

const useApi = <T>(url: string): ApiResponse<T> => {
  // Always returns same structure
  return { data, error, loading }
}
```

## Avoiding Confusion

### No Clever Code
**Rule**: Avoid clever tricks that sacrifice readability.

#### ✅ Good Example
```typescript
// Clear and obvious
const isAdult = (age: number): boolean => {
  return age >= 18
}

const doubleArray = (arr: number[]): number[] => {
  return arr.map(n => n * 2)
}
```

#### ❌ Bad Example
```typescript
// Too clever, hard to read
const isAdult = (age: number): boolean => !!(age >= 18)

const doubleArray = (arr: number[]): number[] => {
  return arr.map(n => n << 1)  // Bit shifting for multiplication?
}

// Nested ternaries
const status = a ? b ? 'x' : 'y' : c ? 'z' : 'w'
```

### No Magic Numbers
**Rule**: All numbers must have named constants.

#### ✅ Good Example
```typescript
const SECONDS_IN_DAY = 86400
const MAX_RETRY_ATTEMPTS = 3
const DEFAULT_PAGE_SIZE = 20
const SALES_TAX_RATE = 0.08

const calculateExpiry = () => {
  return Date.now() + (SECONDS_IN_DAY * 1000)
}

const fetchData = async (page = 1) => {
  return api.get(`/items?page=${page}&limit=${DEFAULT_PAGE_SIZE}`)
}
```

#### ❌ Bad Example
```typescript
const calculateExpiry = () => {
  return Date.now() + 86400000  // What is this number?
}

if (retries > 3) {  // Magic number
  throw new Error('Failed')
}

const tax = price * 0.08  // What's 0.08?
```

## React-Specific Readability

### Component Structure
```typescript
// ✅ Good: Predictable structure
const MyComponent = ({ prop1, prop2 }: Props) => {
  // 1. Hooks
  const [state, setState] = useState()
  const data = useQuery()

  // 2. Derived state
  const isValid = state && data

  // 3. Handlers
  const handleClick = () => { }

  // 4. Effects
  useEffect(() => { }, [])

  // 5. Render
  return <div />
}
```

### Conditional Rendering
```typescript
// ✅ Good: Clear conditions
if (loading) return <Spinner />
if (error) return <ErrorMessage error={error} />
if (!data) return <NoData />

return <DataDisplay data={data} />

// ❌ Bad: Nested ternaries
return loading ? <Spinner /> : error ? <Error /> : !data ? <NoData /> : <Data data={data} />
```

## Readability Checklist

Before committing code, verify:

- [ ] Variable names clearly indicate their purpose
- [ ] Functions have descriptive names
- [ ] Complex logic has explanatory comments
- [ ] No single function exceeds 30 lines
- [ ] Consistent formatting throughout
- [ ] No deeply nested conditions (max 3 levels)
- [ ] All magic numbers are named constants
- [ ] Similar operations use consistent patterns
- [ ] No clever one-liners that require thinking
- [ ] Code can be understood without context

## Red Flags

Signs your code is not readable:

1. You need to add comments explaining WHAT the code does
2. Variable names like `temp`, `data`, `obj`, `val`
3. Functions named `process`, `handle`, `manage`, `do`
4. Nested ternary operators
5. Single-letter variable names (except loop indices)
6. Inconsistent patterns for similar operations
7. Dense one-liners that do multiple things
8. Mixed naming conventions (camelCase vs snake_case)

## Remember

> "Any fool can write code that a computer can understand. Good programmers write code that humans can understand." - Martin Fowler

Write code as if the person who maintains it is a violent psychopath who knows where you live. That person might be you in six months.