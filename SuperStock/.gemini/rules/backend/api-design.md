# API Design Rules

**Priority: 🔴 CRITICAL**
**Applies to: Backend Services, REST APIs**

## RESTful API Principles

### 1. Resource-Based URLs
```typescript
// ✅ Good: Resource-based, noun-focused
GET    /api/users          // List users
GET    /api/users/123      // Get specific user
POST   /api/users          // Create user
PUT    /api/users/123      // Update entire user
PATCH  /api/users/123      // Partial update
DELETE /api/users/123      // Delete user

GET    /api/users/123/posts     // User's posts
POST   /api/users/123/posts     // Create post for user

// ❌ Bad: Action-based URLs
GET    /api/getUsers
POST   /api/createUser
POST   /api/updateUserEmail
GET    /api/getUserPosts
```

### 2. HTTP Methods Semantics
```typescript
// ✅ Good: Proper HTTP methods
app.get('/api/products', getProducts)        // READ - Idempotent
app.post('/api/products', createProduct)     // CREATE - Not idempotent
app.put('/api/products/:id', replaceProduct) // REPLACE - Idempotent
app.patch('/api/products/:id', updateProduct) // UPDATE - Idempotent
app.delete('/api/products/:id', deleteProduct) // DELETE - Idempotent

// ❌ Bad: Wrong methods
app.post('/api/products/delete/:id')  // DELETE with POST
app.get('/api/products/create')       // CREATE with GET
```

### 3. Status Codes
```typescript
// ✅ Good: Appropriate status codes
// Success
200 OK              // Successful GET, PUT, PATCH
201 Created         // Successful POST
204 No Content      // Successful DELETE

// Client Errors
400 Bad Request     // Invalid syntax/parameters
401 Unauthorized    // Authentication required
403 Forbidden       // Authenticated but not authorized
404 Not Found       // Resource doesn't exist
409 Conflict        // State conflict (duplicate)
422 Unprocessable   // Validation errors

// Server Errors
500 Internal Error  // Server fault
502 Bad Gateway     // Upstream error
503 Unavailable     // Temporary overload/maintenance

// Example implementation
const createUser = async (req: Request, res: Response) => {
  try {
    const validation = validateUser(req.body)
    if (!validation.valid) {
      return res.status(422).json({
        error: 'Validation failed',
        details: validation.errors
      })
    }

    const user = await UserService.create(req.body)
    return res.status(201).json(user)

  } catch (error) {
    if (error.code === 'DUPLICATE') {
      return res.status(409).json({
        error: 'User already exists'
      })
    }
    return res.status(500).json({
      error: 'Internal server error'
    })
  }
}
```

## Response Format

### 1. Consistent Structure
```typescript
// ✅ Good: Consistent response format
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    page?: number
    total?: number
    timestamp?: string
  }
}

// Success response
{
  "success": true,
  "data": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z"
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Email format is invalid"
    }
  }
}
```

### 2. Pagination
```typescript
// ✅ Good: Standardized pagination
interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  links: {
    self: string
    first: string
    last: string
    next?: string
    prev?: string
  }
}

// GET /api/users?page=2&limit=20
{
  "data": [...],
  "pagination": {
    "page": 2,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": true
  },
  "links": {
    "self": "/api/users?page=2&limit=20",
    "first": "/api/users?page=1&limit=20",
    "last": "/api/users?page=5&limit=20",
    "next": "/api/users?page=3&limit=20",
    "prev": "/api/users?page=1&limit=20"
  }
}
```

## Request Validation

### 1. Input Validation
```typescript
// ✅ Good: Comprehensive validation
import { z } from 'zod'

const CreateUserSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(100),
  age: z.number().min(13).max(120).optional(),
  role: z.enum(['user', 'admin']).default('user')
})

const validateRequest = (schema: z.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: result.error.flatten()
        }
      })
    }

    req.body = result.data
    next()
  }
}

// Usage
app.post(
  '/api/users',
  validateRequest(CreateUserSchema),
  createUser
)
```

### 2. Query Parameter Validation
```typescript
// ✅ Good: Query validation
const ListUsersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.enum(['name', 'created', 'email']).default('created'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional()
})

app.get(
  '/api/users',
  validateQuery(ListUsersSchema),
  getUsers
)
```

## Authentication & Authorization

### 1. Token-Based Auth
```typescript
// ✅ Good: JWT authentication
const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required'
    })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(payload.userId)
    next()
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired token'
    })
  }
}
```

### 2. Role-Based Authorization
```typescript
// ✅ Good: Role checking
const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions'
      })
    }

    next()
  }
}

// Usage
app.delete(
  '/api/users/:id',
  authenticateToken,
  authorize('admin', 'super_admin'),
  deleteUser
)
```

## API Versioning

### 1. URL Versioning
```typescript
// ✅ Good: Clear versioning
app.use('/api/v1', v1Routes)
app.use('/api/v2', v2Routes)

// Routes
GET /api/v1/users
GET /api/v2/users  // New response format
```

### 2. Header Versioning
```typescript
// ✅ Alternative: Header-based
app.use((req, res, next) => {
  const version = req.headers['api-version'] || 'v1'
  req.apiVersion = version
  next()
})
```

## Rate Limiting

```typescript
// ✅ Good: Rate limiting
import rateLimit from 'express-rate-limit'

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
})

const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute for sensitive operations
})

app.use('/api', apiLimiter)
app.use('/api/auth/login', strictLimiter)
app.use('/api/auth/reset-password', strictLimiter)
```

## Error Handling

### Centralized Error Handler
```typescript
// ✅ Good: Centralized error handling
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
  }
}

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    })
  }

  // Log unexpected errors
  console.error('Unexpected error:', err)

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  })
}

app.use(errorHandler)
```

## API Documentation

### OpenAPI/Swagger
```typescript
// ✅ Good: Document your API
/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
```

## API Checklist

- [ ] RESTful resource naming
- [ ] Appropriate HTTP methods
- [ ] Correct status codes
- [ ] Consistent response format
- [ ] Input validation
- [ ] Authentication implemented
- [ ] Authorization checks
- [ ] Rate limiting configured
- [ ] Error handling centralized
- [ ] API documented
- [ ] Versioning strategy
- [ ] CORS configured
- [ ] Security headers set
- [ ] Request logging

## Remember

- **Resources** not actions
- **Status codes** tell the story
- **Validate** everything
- **Version** from day one
- **Document** as you build
- **Secure** by default