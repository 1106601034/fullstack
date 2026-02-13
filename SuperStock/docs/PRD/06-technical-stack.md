# 6. Technical Stack

[← Back to Index](./README.md) | [← Previous: User Interface](./05-user-interface.md)

---

## 6.1 Backend - Core

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | ASP.NET Core Web API | 8.0 |
| Language | C# | 12 |
| ORM | Entity Framework Core | 8.0 |
| Database | PostgreSQL | 16 |
| Authentication | JWT Bearer Tokens | — |
| Password Hashing | BCrypt | — |
| API Documentation | Swagger / OpenAPI | 3.0 |
| Validation | FluentValidation | — |
| Mapping | AutoMapper | — |

## 6.2 Backend - Architecture

### Architecture Decision: Modular Monolith with Vertical Slices

For an IMS where **data consistency is critical** (stock accuracy, FEFO calculations), we use a hybrid approach that balances simplicity with scalability.

| Component | Technology | Purpose |
|-----------|------------|---------|
| Architecture Pattern | Modular Monolith + Vertical Slices | High cohesion, easy extraction to microservices |
| Mediator | MediatR | Decouple request handlers, CQRS-lite |
| Module Communication | In-process method calls | Modules interact via public APIs only |
| Dependency Rule | Clean Architecture principles | Business logic independent of infrastructure |

### Why This Approach?

| Architecture | Pros | Cons |
|--------------|------|------|
| **Clean Architecture (Strict)** | Excellent testability; decoupled layers | Verbose; simple CRUD requires too much boilerplate |
| **Vertical Slices** | High cohesion; all code for a feature in one place | Can become spaghetti without layering rules |
| **Microservices** | Independent scaling | Distributed transactions complexity; kills ACID for inventory |
| **Modular Monolith + Slices** ✅ | Best of both; single deployment; easy future extraction | Requires discipline to maintain boundaries |

### Project Structure

```
SuperStock.API/                        → Host, DI configuration, middleware
│
├── Modules/
│   ├── Catalog/                       → Product & Category management
│   │   ├── Features/
│   │   │   ├── CreateProduct/
│   │   │   │   ├── CreateProductEndpoint.cs
│   │   │   │   ├── CreateProductCommand.cs
│   │   │   │   └── CreateProductHandler.cs
│   │   │   ├── GetProduct/
│   │   │   ├── UpdateProduct/
│   │   │   └── DeleteProduct/
│   │   ├── Domain/                    → Product, Category, Barcode entities
│   │   ├── Data/                      → EF configurations, repositories
│   │   └── CatalogModule.cs           → Module registration
│   │
│   ├── Inventory/                     → Stock, Batches, FEFO logic
│   │   ├── Features/
│   │   │   ├── ReceiveGoods/
│   │   │   ├── AdjustStock/
│   │   │   ├── RecordWaste/
│   │   │   ├── GetExpiringItems/
│   │   │   └── GetLowStock/
│   │   ├── Domain/
│   │   ├── Data/
│   │   └── InventoryModule.cs
│   │
│   ├── Sales/                         → POS, transactions
│   │   ├── Features/
│   │   │   ├── ProcessSale/
│   │   │   ├── VoidSale/
│   │   │   └── GetSale/
│   │   ├── Domain/
│   │   ├── Data/
│   │   └── SalesModule.cs
│   │
│   ├── Users/                         → Authentication, authorization
│   │   ├── Features/
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   └── ChangePassword/
│   │   ├── Domain/
│   │   ├── Data/
│   │   └── UsersModule.cs
│   │
│   └── Reports/                       → Reporting & analytics
│       ├── Features/
│       │   ├── ShrinkageReport/
│       │   ├── InventoryValueReport/
│       │   └── ExpiringItemsReport/
│       └── ReportsModule.cs
│
├── Shared/                            → Cross-cutting concerns
│   ├── Domain/                        → Base entities, value objects
│   ├── Infrastructure/                → Common DB, caching, logging
│   ├── Behaviors/                     → MediatR pipeline (validation, logging)
│   └── Exceptions/                    → Custom exception types
│
└── Program.cs                         → Application entry point
```

### Vertical Slice Example: AdjustStock Feature

```
Modules/Inventory/Features/AdjustStock/
├── AdjustStockEndpoint.cs      → POST /api/inventory/adjust
├── AdjustStockCommand.cs       → Request DTO with validation
├── AdjustStockHandler.cs       → Business logic (FEFO, transactions)
├── AdjustStockValidator.cs     → FluentValidation rules
└── AdjustStockResponse.cs      → Response DTO
```

**Key Principles:**

1. **Module Isolation**: Modules only communicate via public interfaces
2. **Feature Cohesion**: All code for a use case lives together
3. **Dependency Rule**: Handlers don't depend on endpoints
4. **Future-Proof**: Any module can be extracted to a microservice

---

## 6.3 Backend - Logging & Observability

| Component | Technology | Purpose |
|-----------|------------|---------|
| Structured Logging | Serilog | Rich, queryable logs |
| Log Sinks | Console + File + Seq (optional) | Log output destinations |
| Health Checks | AspNetCore.Diagnostics.HealthChecks | Monitor DB, dependencies |
| Correlation IDs | Serilog.Enrichers | Trace requests across services |

## 6.4 Backend - Resilience & Performance

| Component | Technology | Purpose |
|-----------|------------|---------|
| Retry Policies | Polly | Handle transient failures |
| Circuit Breaker | Polly | Fail fast on repeated errors |
| Distributed Cache | Redis (StackExchange.Redis) | Reduce DB load, session storage, rate limiting |
| Rate Limiting | AspNetCore.RateLimiting | API protection |
| Response Compression | Built-in middleware | Reduce payload sizes |

## 6.5 Backend - Background Processing

| Component | Technology | Purpose |
|-----------|------------|---------|
| Scheduled Jobs | Hangfire | Expiry alerts, cleanup, reports |
| Background Tasks | IHostedService | Long-running async operations |
| Job Dashboard | Hangfire.Dashboard | Monitor and manage jobs |

---

## 6.6 Frontend - Core

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React | 18 |
| Language | TypeScript | 5.x |
| Build Tool | Vite | 5.x |
| Routing | React Router | 6 |
| Styling | Tailwind CSS | 3.x |
| Icons | Lucide React | — |

## 6.7 Frontend - State & Data

| Component | Technology | Purpose |
|-----------|------------|---------|
| Server State | TanStack Query | API caching, refetching, mutations |
| Client State | React Context + useReducer | Local UI state (auth, theme) |
| Forms | React Hook Form | Form state and validation |
| Schema Validation | Zod | Runtime validation + TypeScript types |
| Tables | TanStack Table | Headless table logic |

## 6.8 Frontend - UI Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| Component Library | shadcn/ui | Accessible, customizable components |
| Primitives | Radix UI | Unstyled accessible primitives |
| Notifications | Sonner | Toast notifications |
| Class Utilities | clsx + tailwind-merge | Conditional class management |
| Date Handling | date-fns | Lightweight date formatting |

---

## 6.9 Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Containerization | Docker + Docker Compose | Consistent environments |
| Database Container | postgres:16-alpine | Lightweight PostgreSQL |
| Cache Container | redis:7-alpine | Distributed caching, rate limiting |
| API Container | mcr.microsoft.com/dotnet/aspnet:8.0 | Production .NET runtime |
| Reverse Proxy | nginx | SSL termination, routing |
| Local Development | Docker Compose with hot reload | Fast development iteration |

## 6.10 CI/CD & Quality

| Component | Technology | Purpose |
|-----------|------------|---------|
| CI/CD Pipeline | GitHub Actions | Automated build, test, deploy |
| Code Quality | StyleCop.Analyzers | C# code style enforcement |
| Linting (Frontend) | ESLint + Prettier | JS/TS code quality |
| Unit Testing (BE) | xUnit + Moq | Backend unit tests |
| Unit Testing (FE) | Vitest | Fast frontend unit tests |
| E2E Testing | Playwright | End-to-end user flow tests |
| Test Data | Bogus | Generate realistic fake data |
| DB Testing | Testcontainers | Real PostgreSQL in integration tests |
| Assertions | FluentAssertions | Readable test assertions |

## 6.11 Development Tools

| Purpose | Tool |
|---------|------|
| Backend IDE | Visual Studio / VS Code + C# extension |
| Frontend IDE | VS Code |
| API Testing | Postman or Thunder Client |
| Database GUI | pgAdmin or DBeaver |
| Version Control | Git |
| Editor Config | .editorconfig |
| Git Hooks | Husky (frontend) |

---

[Next: Non-Functional Requirements →](./07-non-functional.md)
