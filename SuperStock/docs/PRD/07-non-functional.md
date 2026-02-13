# 7. Non-Functional Requirements

[← Back to Index](./README.md) | [← Previous: Technical Stack](./06-technical-stack.md)

---

## 7.1 Performance

| Metric | Target | Notes |
|--------|--------|-------|
| Barcode lookup response | < 200ms (P95) | Critical for POS usability |
| Product list load | < 500ms (P95) | With pagination |
| Sale processing | < 1 second | Including FEFO calculation |
| Report generation | < 3 seconds | For standard date ranges |

## 7.2 Scalability Targets

For this development project, design for:

- **10,000 - 50,000 SKUs**
- **100,000+ batches**
- **1,000,000+ transactions** (historical)
- **10 concurrent users**

## 7.3 Security

| Requirement | Implementation |
|-------------|----------------|
| Password storage | BCrypt with cost factor 12 |
| Authentication | JWT with 24-hour expiry |
| Authorization | Role-based middleware |
| Input validation | Server-side validation on all endpoints |
| SQL injection prevention | Parameterized queries via EF Core |
| XSS prevention | React's default escaping + CSP headers |

## 7.4 Data Integrity

| Requirement | Implementation |
|-------------|----------------|
| Referential integrity | Foreign key constraints |
| Concurrent updates | Optimistic concurrency (row version) |
| Audit trail | Immutable transaction log |
| Soft deletes | `is_active` flags, no hard deletes |

---

[Next: Testing Strategy →](./08-testing.md)
