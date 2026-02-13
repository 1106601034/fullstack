# 8. Testing Strategy

[← Back to Index](./README.md) | [← Previous: Non-Functional Requirements](./07-non-functional.md)

---

## 8.1 Backend Testing

| Type | Scope | Tools |
|------|-------|-------|
| Unit Tests | Business logic, FEFO algorithm | xUnit, Moq |
| Integration Tests | API endpoints with test database | xUnit, WebApplicationFactory |

**Priority test cases:**

- FEFO deduction with multiple batches
- FEFO with mixed expiry and non-expiry items
- Insufficient stock handling
- Role-based access control

## 8.2 Frontend Testing

| Type | Scope | Tools |
|------|-------|-------|
| Component Tests | Individual components | React Testing Library |
| Integration Tests | User flows | React Testing Library |

**Priority test cases:**

- Login flow
- POS checkout flow
- Goods receipt submission

## 8.3 Manual Testing

- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile responsiveness (iOS Safari, Android Chrome)
- Accessibility testing (keyboard navigation, screen reader)

## 8.4 Test Coverage Goals

| Area | Target Coverage |
|------|-----------------|
| Backend business logic | 80%+ |
| API endpoints | 70%+ |
| Frontend components | 60%+ |
| E2E critical paths | 100% of P0 features |

---

[Next: Deployment →](./09-deployment.md)
