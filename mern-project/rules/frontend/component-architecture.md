# React Component Architecture Rules

**Priority: 🔴 CRITICAL**
**Applies to: React/TypeScript Frontend**

## Component Organization

### File Structure
**Rule**: One component per file, with related types and styles.

```
components/
  UserCard/
    UserCard.tsx         # Main component
    UserCard.types.ts    # TypeScript interfaces
    UserCard.styles.ts   # Styled components/styles
    UserCard.test.tsx    # Component tests
    index.ts            # Re-export
```

### Component Types

#### 1. Presentational Components
**Rule**: Pure, stateless, focused on UI.

```typescript
// ✅ Good: Pure presentational component
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  disabled = false
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  )
}
```

#### 2. Container Components
**Rule**: Handle business logic and data fetching.

```typescript
// ✅ Good: Container with logic
const UserListContainer = () => {
  const { data: users, loading, error } = useUsers()
  const [filter, setFilter] = useState('')

  const filteredUsers = users?.filter(u =>
    u.name.toLowerCase().includes(filter.toLowerCase())
  )

  if (loading) return <Spinner />
  if (error) return <ErrorMessage error={error} />

  return (
    <UserList
      users={filteredUsers}
      onFilterChange={setFilter}
      filter={filter}
    />
  )
}
```

#### 3. Layout Components
**Rule**: Define page structure, no business logic.

```typescript
// ✅ Good: Layout component
const PageLayout: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto py-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}
```

## Component Rules

### 1. Single Responsibility
**Rule**: Each component does ONE thing well.

```typescript
// ✅ Good: Focused components
const UserAvatar = ({ imageUrl, name }: Props) => { }
const UserName = ({ name, title }: Props) => { }
const UserBio = ({ bio }: Props) => { }

// ❌ Bad: Component doing too much
const UserEverything = ({ user, posts, friends, settings }) => {
  // Handles display, data fetching, forms, etc.
}
```

### 2. Props Interface
**Rule**: ALWAYS define TypeScript interfaces for props.

```typescript
// ✅ Good: Clear interface
interface CardProps {
  title: string
  description?: string
  image?: {
    src: string
    alt: string
  }
  actions?: React.ReactNode
  className?: string
}

const Card: React.FC<CardProps> = (props) => { }

// ❌ Bad: No interface or inline types
const Card = ({ title, description, image }: any) => { }
```

### 3. Component Composition
**Rule**: Build complex components from simple ones.

```typescript
// ✅ Good: Composition
const UserProfile = ({ user }: { user: User }) => {
  return (
    <Card>
      <CardHeader>
        <UserAvatar user={user} />
        <UserName user={user} />
      </CardHeader>
      <CardBody>
        <UserBio bio={user.bio} />
        <UserStats stats={user.stats} />
      </CardBody>
      <CardFooter>
        <UserActions user={user} />
      </CardFooter>
    </Card>
  )
}
```

### 4. Prop Drilling Prevention
**Rule**: Avoid passing props through multiple levels.

```typescript
// ✅ Good: Use context for deep prop passing
const ThemeContext = React.createContext<Theme>('light')

const App = () => {
  return (
    <ThemeContext.Provider value="dark">
      <Dashboard />
    </ThemeContext.Provider>
  )
}

const DeepChild = () => {
  const theme = useContext(ThemeContext)
  return <div className={theme}>Content</div>
}

// ❌ Bad: Prop drilling
const App = ({ theme }) => <Dashboard theme={theme} />
const Dashboard = ({ theme }) => <Panel theme={theme} />
const Panel = ({ theme }) => <Button theme={theme} />
```

## State Management Rules

### 1. Local State First
**Rule**: Use local state unless sharing is needed.

```typescript
// ✅ Good: Local state for local concerns
const SearchBox = () => {
  const [query, setQuery] = useState('')

  return (
    <input
      value={query}
      onChange={e => setQuery(e.target.value)}
    />
  )
}
```

### 2. Lift State Appropriately
**Rule**: Lift state to the lowest common parent.

```typescript
// ✅ Good: State at right level
const ProductPage = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product>()

  return (
    <>
      <ProductList onSelect={setSelectedProduct} />
      <ProductDetails product={selectedProduct} />
    </>
  )
}
```

### 3. Custom Hooks for Complex State
**Rule**: Extract complex state logic into custom hooks.

```typescript
// ✅ Good: Custom hook
const usePagination = <T,>(items: T[], pageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(items.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentItems = items.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return {
    currentItems,
    currentPage,
    totalPages,
    goToPage,
    nextPage: () => goToPage(currentPage + 1),
    prevPage: () => goToPage(currentPage - 1)
  }
}
```

## Performance Rules

### 1. Memoization
**Rule**: Use memoization for expensive computations.

```typescript
// ✅ Good: Memoized expensive computation
const ExpensiveComponent = ({ data }: Props) => {
  const processedData = useMemo(() => {
    return heavyProcessing(data)
  }, [data])

  const handleClick = useCallback((item: Item) => {
    console.log('Clicked:', item)
  }, [])

  return <List items={processedData} onItemClick={handleClick} />
}
```

### 2. React.memo for Pure Components
**Rule**: Wrap pure components with React.memo.

```typescript
// ✅ Good: Memoized component
const UserCard = React.memo<UserCardProps>(({
  user,
  onClick
}) => {
  return (
    <div onClick={() => onClick(user)}>
      {user.name}
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison if needed
  return prevProps.user.id === nextProps.user.id
})
```

### 3. Lazy Loading
**Rule**: Lazy load heavy components and routes.

```typescript
// ✅ Good: Lazy loading
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Analytics = lazy(() => import('./pages/Analytics'))

const App = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  )
}
```

## Component Patterns

### 1. Compound Components
```typescript
// ✅ Good: Compound component pattern
const Tabs = ({ children, defaultTab }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  )
}

Tabs.List = ({ children }) => <div className="tabs">{children}</div>
Tabs.Tab = ({ id, children }) => { /* ... */ }
Tabs.Panel = ({ id, children }) => { /* ... */ }

// Usage
<Tabs defaultTab="tab1">
  <Tabs.List>
    <Tabs.Tab id="tab1">Tab 1</Tabs.Tab>
    <Tabs.Tab id="tab2">Tab 2</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel id="tab1">Content 1</Tabs.Panel>
  <Tabs.Panel id="tab2">Content 2</Tabs.Panel>
</Tabs>
```

### 2. Render Props
```typescript
// ✅ Good: Render prop pattern
const DataFetcher = <T,>({
  url,
  render
}: {
  url: string
  render: (data: T | null, loading: boolean) => React.ReactNode
}) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [url])

  return <>{render(data, loading)}</>
}

// Usage
<DataFetcher<User>
  url="/api/user"
  render={(user, loading) =>
    loading ? <Spinner /> : <UserProfile user={user} />
  }
/>
```

### 3. Provider Pattern
```typescript
// ✅ Good: Provider pattern
interface AuthContextType {
  user: User | null
  login: (credentials: Credentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null)

  const login = async (credentials: Credentials) => {
    const user = await authenticate(credentials)
    setUser(user)
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

## Component Checklist

Before creating a component:

- [ ] Single responsibility defined
- [ ] Props interface created
- [ ] Proper component type chosen
- [ ] State management approach decided
- [ ] Performance considerations addressed
- [ ] Error boundaries considered
- [ ] Accessibility handled
- [ ] Tests planned

## Anti-Patterns to Avoid

1. **God Components**: Components doing everything
2. **Prop Drilling**: Passing props through many levels
3. **Direct DOM Manipulation**: Using querySelector, getElementById
4. **Inline Functions in JSX**: Creating new functions on each render
5. **Index as Key**: Using array index as key in dynamic lists
6. **Mutation of Props**: Directly modifying props or state
7. **useEffect Without Dependencies**: Missing dependency array
8. **Conditional Hooks**: Hooks inside conditions or loops

## Remember

- Components should be **small** and **focused**
- **Compose** don't complicate
- **Props** are immutable
- **State** is local by default
- **Effects** are for side effects only
- **Performance** optimize when measured, not guessed