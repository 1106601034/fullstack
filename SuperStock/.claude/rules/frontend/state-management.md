# State Management Rules

**Priority: 🔴 CRITICAL**
**Applies to: React/TypeScript Frontend**

## State Management Hierarchy

### Rule: Choose the Right Level
1. **Local State** → Component-specific UI state
2. **Context** → Cross-component shared state
3. **Global Store** → Application-wide state
4. **Server Cache** → Remote data (React Query/SWR)

## Local State Rules

### 1. useState for Simple State
```typescript
// ✅ Good: Simple state
const [isOpen, setIsOpen] = useState(false)
const [count, setCount] = useState(0)
const [user, setUser] = useState<User | null>(null)

// ❌ Bad: Complex state in useState
const [state, setState] = useState({
  users: [],
  loading: false,
  error: null,
  filters: {},
  pagination: {}
})
```

### 2. useReducer for Complex State
```typescript
// ✅ Good: Complex state with useReducer
type State = {
  users: User[]
  loading: boolean
  error: Error | null
  filter: string
  page: number
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: User[] }
  | { type: 'FETCH_ERROR'; payload: Error }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'SET_PAGE'; payload: number }

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null }
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, users: action.payload }
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload }
    case 'SET_FILTER':
      return { ...state, filter: action.payload, page: 1 }
    case 'SET_PAGE':
      return { ...state, page: action.payload }
    default:
      return state
  }
}

const UserList = () => {
  const [state, dispatch] = useReducer(reducer, initialState)
  // Component logic
}
```

## Context Rules

### 1. Split Contexts by Concern
```typescript
// ✅ Good: Separate contexts
const AuthContext = createContext<AuthState>(null)
const ThemeContext = createContext<Theme>('light')
const NotificationContext = createContext<NotificationState>(null)

// ❌ Bad: Everything in one context
const AppContext = createContext({
  auth: {},
  theme: {},
  notifications: {},
  settings: {},
  // ... everything
})
```

### 2. Optimize Context Performance
```typescript
// ✅ Good: Split state and dispatch
const StateContext = createContext<State>(null)
const DispatchContext = createContext<Dispatch>(null)

const Provider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

// Components can subscribe to only what they need
const Component = () => {
  const dispatch = useContext(DispatchContext) // Won't re-render on state change
}
```

## Server State Management

### React Query / TanStack Query
```typescript
// ✅ Good: Server state with React Query
const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}

const useMutateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      // Optimistic update
      queryClient.setQueryData(['users', data.id], data)
      // Invalidate list
      queryClient.invalidateQueries(['users'])
    }
  })
}

// Usage
const UserComponent = () => {
  const { data: users, isLoading, error } = useUsers()
  const mutation = useMutateUser()

  const handleUpdate = (user: User) => {
    mutation.mutate(user)
  }
}
```

## Form State Management

### React Hook Form
```typescript
// ✅ Good: Form state with React Hook Form
interface FormData {
  name: string
  email: string
  age: number
}

const UserForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      email: '',
      age: 18
    }
  })

  const onSubmit = async (data: FormData) => {
    await saveUser(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('name', {
          required: 'Name is required',
          minLength: { value: 2, message: 'Minimum 2 characters' }
        })}
      />
      {errors.name && <span>{errors.name.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
    </form>
  )
}
```

## State Update Rules

### 1. Immutable Updates
```typescript
// ✅ Good: Immutable updates
setState(prev => ({ ...prev, name: 'New Name' }))
setItems(prev => [...prev, newItem])
setItems(prev => prev.filter(item => item.id !== id))
setItems(prev => prev.map(item =>
  item.id === id ? { ...item, ...updates } : item
))

// ❌ Bad: Mutating state
state.name = 'New Name' // Mutation!
items.push(newItem)     // Mutation!
items[0].name = 'New'   // Mutation!
```

### 2. Batch Updates
```typescript
// ✅ Good: Batch multiple updates
const handleMultipleUpdates = () => {
  // React 18 automatically batches these
  setCount(c => c + 1)
  setFlag(f => !f)
  setItems(items => [...items, newItem])
}

// For React 17 and below, use unstable_batchedUpdates
import { unstable_batchedUpdates } from 'react-dom'

unstable_batchedUpdates(() => {
  setCount(c => c + 1)
  setFlag(f => !f)
})
```

## Custom Hook State Rules

### 1. Encapsulate Related State
```typescript
// ✅ Good: Custom hook for related state
const useModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState(null)

  const open = useCallback((modalData = null) => {
    setData(modalData)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setData(null)
  }, [])

  return { isOpen, data, open, close }
}

// Usage
const Component = () => {
  const modal = useModal()

  return (
    <>
      <button onClick={() => modal.open({ id: 1 })}>Open</button>
      {modal.isOpen && <Modal data={modal.data} onClose={modal.close} />}
    </>
  )
}
```

### 2. Share State Logic
```typescript
// ✅ Good: Reusable state logic
const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setStoredValue = useCallback((newValue: T | ((val: T) => T)) => {
    setValue(prev => {
      const valueToStore = newValue instanceof Function
        ? newValue(prev)
        : newValue

      window.localStorage.setItem(key, JSON.stringify(valueToStore))
      return valueToStore
    })
  }, [key])

  return [value, setStoredValue] as const
}
```

## Performance Optimization

### 1. Memo Dependencies
```typescript
// ✅ Good: Stable dependencies
const StableComponent = ({ userId }: Props) => {
  const fetchUser = useCallback(async () => {
    const user = await api.getUser(userId)
    return user
  }, [userId]) // Only re-create when userId changes

  useEffect(() => {
    fetchUser()
  }, [fetchUser]) // Stable dependency
}
```

### 2. Selector Patterns
```typescript
// ✅ Good: Selective subscriptions
const useUserName = () => {
  const user = useContext(UserContext)
  return user?.name // Only re-render when name changes
}

// With Redux or Zustand
const userName = useStore(state => state.user.name)
```

## State Management Checklist

- [ ] State at the lowest necessary level
- [ ] Immutable state updates
- [ ] Proper dependency arrays
- [ ] Memoized expensive computations
- [ ] Server state separated from UI state
- [ ] Form state properly managed
- [ ] Context split by concern
- [ ] Custom hooks for reusable logic
- [ ] Optimistic updates for mutations
- [ ] Error states handled

## Anti-Patterns to Avoid

1. **State Duplication**: Same data in multiple places
2. **Derived State in State**: Storing computed values
3. **Nested State Objects**: Deeply nested state structures
4. **Missing Dependencies**: useEffect without proper deps
5. **Stale Closures**: Using outdated state in callbacks
6. **Sync State Issues**: Not handling async state properly
7. **Over-fetching**: Fetching same data multiple times
8. **Under-fetching**: Multiple requests when one would do

## Remember

- **Local by default**, lift when needed
- **Immutable always**, never mutate
- **Server state** ≠ UI state
- **Memoize** expensive operations
- **Split** contexts for performance
- **Custom hooks** for reusability