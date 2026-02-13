# 4. Functional Requirements

[← Back to Index](./README.md) | [← Previous: API Specification](./03-api-specification.md)

---

## 4.1 Product Management

| ID | Requirement | Priority |
|----|-------------|----------|
| PM-01 | Create, read, update, soft-delete products | P0 |
| PM-02 | Assign products to hierarchical categories | P0 |
| PM-03 | Support multiple barcodes per product | P0 |
| PM-04 | Define unit of measure (pcs, kg, g, lbs, pack) | P0 |
| PM-05 | Set low stock threshold per product | P0 |
| PM-06 | Search products by name, SKU, barcode | P0 |
| PM-07 | Filter products by category | P1 |
| PM-08 | Bulk import products via CSV | P2 |

## 4.2 Batch and Expiry Tracking

| ID | Requirement | Priority |
|----|-------------|----------|
| BT-01 | Track inventory at batch level | P0 |
| BT-02 | Record expiry date per batch | P0 |
| BT-03 | Record batch/lot number for traceability | P0 |
| BT-04 | Support non-perishable items (no expiry) | P0 |
| BT-05 | Display batches ordered by expiry (FEFO) | P0 |
| BT-06 | Alert on items expiring within N days (configurable) | P0 |

## 4.3 Inventory Operations

| ID | Requirement | Priority |
|----|-------------|----------|
| IO-01 | Record goods receipt with batch details | P0 |
| IO-02 | Automatic FEFO deduction on sales | P0 |
| IO-03 | Manual inventory adjustment with reason | P0 |
| IO-04 | Record waste/shrinkage with categorization | P0 |
| IO-05 | View transaction history per product/batch | P0 |
| IO-06 | Display current stock with batch breakdown | P0 |
| IO-07 | Low stock alert list | P0 |
| IO-08 | Prevent negative inventory (validation) | P0 |

## 4.4 FEFO Logic (Detailed)

When stock is deducted (sale or waste), the system must:

1. Query all batches for the product with `quantity_on_hand > 0`
2. Order batches by `expiry_date ASC` (NULL expiry dates come last)
3. Deduct from the first (oldest) batch
4. If quantity exceeds first batch, continue to next batch
5. Record transaction(s) for each batch affected
6. Fail with error if total available stock is insufficient

**Example:**

- Product: Milk
- Batches: A (exp: Feb 10, qty: 5), B (exp: Feb 15, qty: 20)
- Sale quantity: 8

Result:
- Deduct 5 from Batch A (now 0)
- Deduct 3 from Batch B (now 17)
- Create 2 inventory transactions

## 4.5 POS Simulation

| ID | Requirement | Priority |
|----|-------------|----------|
| POS-01 | Scan/enter barcode to add item | P0 |
| POS-02 | Display product name and price | P0 |
| POS-03 | Adjust quantity in cart | P0 |
| POS-04 | Remove item from cart | P0 |
| POS-05 | Calculate and display total | P0 |
| POS-06 | Complete sale (checkout) | P0 |
| POS-07 | Void completed sale (manager only) | P1 |
| POS-08 | Handle insufficient stock gracefully | P0 |

## 4.6 Shrinkage Recording

| ID | Requirement | Priority |
|----|-------------|----------|
| SH-01 | Record waste with quantity and reason | P0 |
| SH-02 | Support reason codes: expired, damaged, theft, vendor_return, admin_error, sampling, donation, other | P0 |
| SH-03 | Require notes for "other" reason | P0 |
| SH-04 | Select specific batch when recording | P0 |
| SH-05 | Calculate estimated value lost | P1 |

## 4.7 Reporting

| ID | Requirement | Priority |
|----|-------------|----------|
| RP-01 | Low stock report | P0 |
| RP-02 | Expiring items report (configurable days) | P0 |
| RP-03 | Shrinkage summary by reason and period | P1 |
| RP-04 | Inventory valuation report | P2 |
| RP-05 | Export reports to CSV | P2 |

## 4.8 User Management

| ID | Requirement | Priority |
|----|-------------|----------|
| UM-01 | User login with email/password | P0 |
| UM-02 | JWT-based session management | P0 |
| UM-03 | Role-based access control (RBAC) | P0 |
| UM-04 | Admin can create/edit/deactivate users | P0 |
| UM-05 | Users can change own password | P1 |
| UM-06 | Audit log of user actions | P2 |

---

## Priority Legend

| Priority | Meaning |
|----------|---------|
| **P0** | Must have for MVP |
| **P1** | Should have (include if time permits) |
| **P2** | Nice to have (future enhancement) |

---

[Next: User Interface →](./05-user-interface.md)
