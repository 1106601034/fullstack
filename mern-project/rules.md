# Development Rules & Guidelines

Welcome to the Airbotix website development team! This document outlines our code style rules, git practices, and collaboration etiquette to ensure consistent, high-quality development.

## 📋 Table of Contents

- [Code Style Rules](#-code-style-rules)
- [Git Practices](#-git-practices)
- [Team Collaboration](#-team-collaboration)
- [Project Structure](#-project-structure)
- [Testing Guidelines](#-testing-guidelines)
- [Performance Standards](#-performance-standards)

## 🎨 Code Style Rules

### TypeScript & React

#### General Principles
- **Consistency is key** - Follow established patterns in the codebase
- **Readability first** - Code should be self-documenting
- **Type safety** - Leverage TypeScript's type system fully
- **Component composition** - Prefer composition over inheritance

#### Naming Conventions

```typescript
// ✅ Good
const UserProfile = () => { ... }           // PascalCase for components
const useUserData = () => { ... }           // camelCase for hooks
const API_BASE_URL = 'https://...'          // SCREAMING_SNAKE_CASE for constants
const isUserLoggedIn = true                 // camelCase for variables
const handleButtonClick = () => { ... }     // camelCase for functions

// ❌ Bad
const userprofile = () => { ... }
const Use_User_Data = () => { ... }
const apibaseurl = 'https://...'
```

#### File & Folder Structure

```
src/
├── components/
│   ├── ui/                 # Generic UI components
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── layout/             # Layout components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── features/           # Feature-specific components
├── pages/                  # Page components
├── hooks/                  # Custom hooks
├── utils/                  # Utility functions
├── types/                  # TypeScript type definitions
└── assets/                 # Static assets
```

#### Component Guidelines

```typescript
// ✅ Good - Well-structured component
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}

const Button = ({ 
  variant, 
  size = 'md', 
  disabled = false, 
  onClick, 
  children 
}: ButtonProps) => {
  const baseClasses = 'font-medium rounded-lg transition-colors duration-200'
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white'
  }
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button
```

#### Hooks Guidelines

```typescript
// ✅ Good - Custom hook with proper TypeScript
interface UseApiDataReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

const useApiData = <T>(url: string): UseApiDataReturn<T> => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(url)
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
```

### CSS & Styling

#### TailwindCSS Best Practices

```tsx
// ✅ Good - Organized classes, responsive design
<div className="
  flex flex-col gap-4 p-6
  bg-white rounded-lg shadow-sm
  md:flex-row md:gap-6 md:p-8
  hover:shadow-md transition-shadow duration-200
">
  <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
    Title
  </h2>
</div>

// ❌ Bad - Long unorganized class string
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-sm md:flex-row md:gap-6 md:p-8 hover:shadow-md transition-shadow duration-200">
```

#### Custom CSS Components

```css
/* ✅ Good - Use @layer for organization */
@layer components {
  .btn-primary {
    @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
  }
}
```

## 🔄 Git Practices

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
# ✅ Good commit messages
feat: add workshop booking form component
fix: resolve mobile navigation menu overflow
docs: update deployment instructions in README
style: improve button hover animations
refactor: extract common form validation logic
test: add unit tests for user authentication
chore: update dependencies to latest versions

# ❌ Bad commit messages
fixed stuff
update
wip
changes
```

### Branch Naming

```bash
# ✅ Good branch names
feature/workshop-booking-form
fix/mobile-navigation-overflow
docs/update-deployment-guide
refactor/form-validation-logic
hotfix/critical-security-patch

# ❌ Bad branch names
fix
new-feature
john-changes
temp
```

### Pull Request Guidelines

#### PR Title Format
```
[TYPE] Brief description of changes

Examples:
[FEAT] Add workshop booking functionality
[FIX] Resolve mobile navigation issues
[DOCS] Update README with new deployment steps
```

#### PR Description Template
```markdown
## 🎯 What does this PR do?
Brief description of the changes and why they're needed.

## 🧪 How to test?
1. Step-by-step instructions
2. Expected behavior
3. Edge cases to consider

## 📸 Screenshots (if applicable)
Before/after screenshots for UI changes

## ✅ Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console errors
- [ ] Responsive design tested
```

### Branching Strategy

```
main (production-ready code)
├── develop (integration branch)
│   ├── feature/workshop-booking
│   ├── feature/media-gallery
│   └── fix/mobile-navigation
└── hotfix/critical-security-fix (emergency fixes)
```

## 🤝 Team Collaboration

### Code Review Guidelines

#### For Authors
- **Self-review first** - Review your own code before requesting review
- **Small, focused PRs** - Easier to review, faster to merge
- **Clear descriptions** - Explain what, why, and how
- **Test thoroughly** - Include manual testing steps
- **Address feedback promptly** - Respond to comments within 24 hours

#### For Reviewers
- **Be constructive** - Suggest improvements, don't just point out problems
- **Ask questions** - "Why did you choose this approach?"
- **Praise good code** - Acknowledge well-written code
- **Focus on impact** - Prioritize feedback by importance
- **Review promptly** - Aim to review within 24 hours

#### Review Checklist
```markdown
## Code Quality
- [ ] Code is readable and well-commented
- [ ] No unused imports or variables
- [ ] Error handling is appropriate
- [ ] TypeScript types are properly defined

## Functionality
- [ ] Code works as intended
- [ ] Edge cases are handled
- [ ] No breaking changes to existing features
- [ ] Performance implications considered

## Design & UX
- [ ] UI matches design specifications
- [ ] Responsive across all breakpoints
- [ ] Accessibility considerations met
- [ ] Loading states and error handling
```

### Communication

#### Daily Standups
- **What did you do yesterday?**
- **What will you do today?**
- **Any blockers or impediments?**
- **Any help needed from team members?**

#### Slack/Communication Guidelines
- **Use threads** for detailed discussions
- **@channel sparingly** - only for urgent, all-team announcements
- **Code snippets** - use code blocks for better readability
- **Status updates** - keep team informed of progress and blockers

## 🏗️ Project Structure

### Component Organization

```typescript
// ✅ Good - Single responsibility, clear interface
interface WorkshopCardProps {
  workshop: Workshop
  onBookClick: (workshopId: string) => void
}

const WorkshopCard = ({ workshop, onBookClick }: WorkshopCardProps) => {
  return (
    <div className="card">
      <h3>{workshop.title}</h3>
      <p>{workshop.description}</p>
      <Button 
        variant="primary" 
        onClick={() => onBookClick(workshop.id)}
      >
        Book Now
      </Button>
    </div>
  )
}
```

### State Management

```typescript
// ✅ Good - Use appropriate state management
// Local state for component-specific data
const [isMenuOpen, setIsMenuOpen] = useState(false)

// Context for app-wide state
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {}
})

// External state management for complex app state
// Consider Zustand or Redux Toolkit for larger applications
```

## 🧪 Testing Guidelines

### Unit Testing
```typescript
// ✅ Good - Test component behavior
describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button onClick={() => {}}>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button onClick={() => {}} disabled>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Integration Testing
- Test user workflows end-to-end
- Test API integrations with mock data
- Test responsive behavior across devices

## ⚡ Performance Standards

### Core Web Vitals Targets
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Optimization Techniques
```typescript
// ✅ Good - Code splitting and lazy loading
const WorkshopPage = lazy(() => import('./pages/WorkshopPage'))
const MediaGallery = lazy(() => import('./components/MediaGallery'))

// ✅ Good - Memoization for expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

// ✅ Good - Optimized images
<img 
  src="workshop-hero.jpg"
  alt="Students working with robots"
  loading="lazy"
  width={800}
  height={600}
/>
```

### Bundle Size Guidelines
- **Individual chunks**: < 244KB gzipped
- **Total bundle size**: < 1MB gzipped
- **Use bundle analyzer** to monitor size growth

## 🚨 Common Pitfalls to Avoid

### React Anti-patterns
```typescript
// ❌ Bad - Mutating state directly
const [items, setItems] = useState([])
items.push(newItem) // DON'T DO THIS

// ✅ Good - Immutable state updates
setItems(prev => [...prev, newItem])

// ❌ Bad - Missing dependency in useEffect
useEffect(() => {
  fetchData(userId)
}, []) // Missing userId dependency

// ✅ Good - Complete dependency array
useEffect(() => {
  fetchData(userId)
}, [userId])
```

### TypeScript Anti-patterns
```typescript
// ❌ Bad - Using 'any' type
const handleData = (data: any) => { ... }

// ✅ Good - Proper typing
interface ApiResponse {
  id: string
  name: string
  email: string
}
const handleData = (data: ApiResponse) => { ... }
```

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

### Tools
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/)

---

## 🤖 AI Code Better Rules

*These additional rules ensure AI can better understand, analyze, and maintain our codebase.*

### String Constants (Critical Rule)

**RULE**: Never use string literals in conditional statements or comparisons

```typescript
// ❌ FORBIDDEN - String literals in conditions
if (status === 'completed') { ... }
if (userType === 'admin') { ... }
if (category === 'courses') { ... }

// ✅ REQUIRED - Use constants
const STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress'
} as const

const USER_TYPES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  TEACHER: 'teacher'
} as const

if (status === STATUS.COMPLETED) { ... }
if (userType === USER_TYPES.ADMIN) { ... }
```

**Why**: AI systems have difficulty understanding string-based logic. Constants provide clear semantic meaning and prevent typos.

### File Size Limits (Critical Rule)

**RULE**: Single file must not exceed 1000 lines

```typescript
// ❌ BAD - 1200 line component file
const MassiveComponent = () => {
  // ... 1200 lines of code
}

// ✅ GOOD - Split into smaller components
const Header = () => { ... }           // 150 lines
const SearchSection = () => { ... }    // 200 lines  
const ContentList = () => { ... }      // 250 lines
const Footer = () => { ... }           // 100 lines

const MainComponent = () => {          // 100 lines
  return (
    <>
      <Header />
      <SearchSection />
      <ContentList />
      <Footer />
    </>
  )
}
```

**Enforcement**:
- **800+ lines**: Issue warning in PR
- **1000+ lines**: Mandatory refactoring required
- **Exception**: Configuration files only

**Why**: AI has context window limitations. Large files reduce AI's ability to understand and modify code accurately.

### Naming Disambiguation (Critical Rule)

**RULE**: Avoid similar names that can confuse AI systems

```typescript
// ❌ BAD - Confusing similar names
const adminUser = {...}
const superAdminUser = {...}
const userAdmin = {...}

// ✅ GOOD - Clearly distinct names  
const standardAdmin = {...}
const systemSupervisor = {...}
const departmentManager = {...}

// ❌ BAD - Ambiguous file names
AdminPanel.tsx
SuperAdminPanel.tsx
AdminSettings.tsx

// ✅ GOOD - Clear, distinct names
StandardAdminDashboard.tsx
SystemSupervisorConsole.tsx
DepartmentManagerSettings.tsx
```

**Guidelines**:
- Use **descriptive prefixes** instead of modifiers
- Avoid **similar-sounding** terms in the same context
- Choose **semantically different** words when possible

### TypeScript Interface Requirements (Mandatory)

**RULE**: All data structures must have explicit TypeScript interfaces

```typescript
// ❌ FORBIDDEN - No type definition
const processData = (data: any) => { ... }

// ✅ REQUIRED - Explicit interface
interface UserData {
  id: string
  name: string
  email: string
  role: 'admin' | 'student' | 'teacher'
  createdAt: Date
}

const processData = (data: UserData) => { ... }

// ✅ REQUIRED - Complex nested interfaces
interface WorkshopSchedule {
  id: string
  title: string
  instructor: {
    name: string
    expertise: string[]
  }
  sessions: Array<{
    date: Date
    duration: number
    participants: UserData[]
  }>
}
```

**Requirements**:
- **All props interfaces** must be defined
- **API response types** must be typed
- **State structures** must have interfaces
- **No `any` types** except for third-party library compatibility

### Documentation Requirements (Mandatory)

**RULE**: Complex features require structured documentation

```markdown
// Required structure for new features:
docs/
├── FEATURE_NAME_SYSTEM_DESIGN.md    # Architecture & components
├── FEATURE_NAME_FUNCTION_DOCS.md    # API & usage documentation  
└── FEATURE_NAME_CODING_RULES.md     # Feature-specific rules
```

**Documentation Content Requirements**:

1. **System Design Document**:
   - Component hierarchy diagram
   - Data flow visualization  
   - File location mapping
   - AI quick-reference guide

2. **Function Documentation**:
   - API interface definitions
   - Usage examples
   - Component props documentation
   - Error handling patterns

3. **File Relationship Mapping**:
   - "If you want to modify X, edit file Y"
   - Cross-reference between related files
   - Dependency documentation

### AI Context Optimization

**RULE**: Structure code for AI comprehension

```typescript
// ✅ GOOD - Clear, single-purpose functions
const validateUserEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const formatUserDisplayName = (user: UserData): string => {
  return `${user.firstName} ${user.lastName}`
}

// ✅ GOOD - Descriptive variable names
const filteredActiveWorkshops = workshops.filter(workshop => workshop.isActive)
const sortedUpcomingEvents = events.sort((a, b) => a.date.getTime() - b.date.getTime())

// ❌ BAD - Vague names that confuse AI
const data = getData()
const temp = processStuff(data)
const result = temp.map(x => x.thing)
```

### Refactoring Triggers

**RULE**: Automatic refactoring requirements

**File Size Trigger**:
```bash
# 800+ lines: Create GitHub issue
# 1000+ lines: Block PR merge until refactored
```

**Naming Conflict Trigger**:
```bash
# Similar names detected: Require renaming
# AI confusion reported: Mandatory disambiguation
```

**Complexity Trigger**:
```bash
# Cyclomatic complexity > 15: Refactor required
# Function > 100 lines: Split into smaller functions
```

### AI-Friendly Code Review Checklist

```markdown
## AI Code Better Checklist

### String Constants
- [ ] No string literals in conditionals
- [ ] All comparison strings use constants
- [ ] Constants are exported and reusable

### File Structure  
- [ ] No files exceed 1000 lines
- [ ] Components have single responsibility
- [ ] Clear file naming convention

### Type Safety
- [ ] All interfaces defined
- [ ] No `any` types (except library compatibility)
- [ ] Props interfaces exported

### Documentation
- [ ] Complex features have docs
- [ ] File relationships documented
- [ ] AI quick-reference included

### Naming Clarity
- [ ] No confusing similar names
- [ ] Descriptive variable names
- [ ] Clear semantic meaning
```

## 🎯 Remember

> "Code is written once but read many times. Write for the next developer (which might be you in 6 months) **and for AI systems that will help maintain it**."

**Questions?** Don't hesitate to ask in our team channel or during standup meetings. We're all here to help each other grow! 🚀

---

*Last updated: 2025年1月*  
*Next review: 2025年4月*