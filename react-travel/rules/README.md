# Coding Rules and Standards

**MANDATORY**: All AI coding tools (Claude Code, Cursor, Copilot, etc.) MUST follow these rules without exception.

## 🚨 CRITICAL REQUIREMENT
Every AI coding assistant MUST read and apply ALL rules in this directory before writing or modifying ANY code.

## Rule Categories

### 1. [General Principles](./general/)
Core coding principles that apply to ALL code:
- [SOLID Principles](./general/solid-principles.md)
- [DRY (Don't Repeat Yourself)](./general/dry-principle.md)
- [KISS (Keep It Simple, Stupid)](./general/kiss-principle.md)
- [Code Readability](./general/readability.md)
- [Error Handling](./general/error-handling.md)

### 2. [Frontend Rules](./frontend/)
React/TypeScript specific rules:
- [Component Architecture](./frontend/component-architecture.md)
- [State Management](./frontend/state-management.md)
- [TypeScript Standards](./frontend/typescript-standards.md)
- [Performance Optimization](./frontend/performance.md)
- [Accessibility Standards](./frontend/accessibility.md)

### 3. [Backend Rules](./backend/)
Backend/API/Database specific rules:
- [API Design](./backend/api-design.md)
- [Database Patterns](./backend/database-patterns.md)
- [Security Standards](./backend/security.md)
- [Service Layer Architecture](./backend/service-architecture.md)
- [Data Validation](./backend/data-validation.md)

### 4. [Deployment Rules](./deployment/)
CI/CD and deployment standards:
- [Build Process](./deployment/build-process.md)
- [Environment Management](./deployment/environment-management.md)
- [GitHub Actions](./deployment/github-actions.md)
- [Performance Monitoring](./deployment/performance-monitoring.md)

### 5. [Existing Rules](.)
Already established rules in this codebase:
- [Coding Principles](./coding-principles.md) - SOLID, KISS, DRY
- [File Organization](./file-organization.md) - 1000-line limit
- [String Constants](./string-constants.md) - No magic strings
- [TypeScript Standards](./typescript-standards.md) - Interface requirements

## Rule Priority

1. **🔴 CRITICAL**: Security, data integrity, authentication
2. **🟠 HIGH**: Performance, code quality, maintainability
3. **🟡 MEDIUM**: Conventions, patterns, best practices
4. **🟢 LOW**: Style preferences, optional optimizations

## Enforcement Checklist

Before ANY code submission, verify:

- [ ] **SOLID** principles applied
- [ ] **DRY** - No code duplication
- [ ] **KISS** - Solution is simple and clear
- [ ] **Readability** - Code is self-documenting
- [ ] **TypeScript** - All types properly defined
- [ ] **Constants** - No magic strings/numbers
- [ ] **File Size** - No file exceeds 1000 lines
- [ ] **Security** - No exposed secrets or vulnerabilities
- [ ] **Testing** - Critical paths have test coverage
- [ ] **Performance** - No obvious bottlenecks

## AI Tool Instructions

### For Claude Code, Cursor, Copilot, and other AI assistants:

1. **ALWAYS** read relevant rules before coding
2. **NEVER** skip rule validation
3. **REFUSE** to write code that violates these rules
4. **EXPLAIN** rule violations when rejecting changes
5. **SUGGEST** compliant alternatives

### Example AI Response:
```
❌ Cannot implement: Violates DRY principle (duplicate logic in 3 files)
✅ Suggestion: Extract shared logic to utils/common.ts
```

## Quick Reference

### Must Follow (Non-negotiable)
- SOLID principles for all architectures
- DRY - Zero code duplication
- KISS - Simplest solution that works
- 1000-line file limit
- TypeScript interfaces for all data
- Named constants for all strings

### Must Avoid
- Magic strings/numbers
- Any type usage in TypeScript
- Inline styles in React
- Direct DOM manipulation in React
- Hardcoded credentials
- Console.log in production code

## Version
Last Updated: 2025-09-16
Version: 2.0.0

---

**Remember**: These rules exist to ensure code quality, maintainability, and team productivity. They are not suggestions - they are requirements.