# 5. User Interface

[← Back to Index](./README.md) | [← Previous: Functional Requirements](./04-functional-requirements.md)

---

## 5.1 Screen List

| Screen | Description | Primary Users |
|--------|-------------|---------------|
| Login | Authentication form | All |
| Dashboard | Overview with alerts and metrics | Manager, Admin |
| Product List | Searchable product table | All |
| Product Detail | View/edit product with batches | Manager, Admin |
| Product Create | New product form | Manager, Admin |
| Category Manager | Category tree CRUD | Manager, Admin |
| Goods Receipt | Form to receive inventory | Clerk, Manager |
| POS Interface | Simulated checkout | All |
| Waste Entry | Record shrinkage form | All |
| Inventory Transactions | Transaction history table | Manager, Admin |
| Low Stock Alert | Filtered product list | All |
| Expiring Items | Items expiring within N days | All |
| Shrinkage Report | Summary and breakdown | Manager, Admin |
| User Management | User CRUD (admin only) | Admin |

## 5.2 UX Requirements

These requirements address the operational environment (warehouse/store floor):

| ID | Requirement | Rationale |
|----|-------------|-----------|
| UX-01 | High contrast color scheme | Visibility under bright warehouse lighting |
| UX-02 | Minimum touch target size: 44x44px | Usability with gloves or on mobile |
| UX-03 | Clear visual feedback for actions (success/error) | Confirmation without audio in noisy environments |
| UX-04 | Keyboard navigation support | Speed for desktop users |
| UX-05 | Mobile-responsive layout | Tablet use during receiving/audits |
| UX-06 | Loading states for async operations | User awareness during API calls |
| UX-07 | Confirmation dialogs for destructive actions | Prevent accidental deletions |

## 5.3 Key Screen Wireframes (Conceptual)

### Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  SuperStock                           [User Name ▼] [Logout]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   LOW STOCK │  │   EXPIRING  │  │   TODAY'S   │          │
│  │     12      │  │     8       │  │   SALES     │          │
│  │   items     │  │   items     │  │   $1,234    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                             │
│  Recent Alerts                                              │
│  ─────────────────────────────────────────────────          │
│  ⚠ Whole Milk 1L - Only 5 units remaining                  │
│  ⚠ Yogurt Strawberry - Expires in 2 days (15 units)        │
│  ⚠ Bread Whole Wheat - Only 3 units remaining              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### POS Interface

```
┌─────────────────────────────────────────────────────────────┐
│  Point of Sale                                    [X Close] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Barcode: [____________________] [Scan]                     │
│                                                             │
│  Cart                                                       │
│  ─────────────────────────────────────────────────────      │
│  │ Whole Milk 1L          x2    $2.99    $5.98   [🗑] │      │
│  │ Bread Whole Wheat      x1    $3.49    $3.49   [🗑] │      │
│  │ Eggs Large 12pk        x1    $4.99    $4.99   [🗑] │      │
│  ─────────────────────────────────────────────────────      │
│                                                             │
│                                    Subtotal:    $14.46      │
│                                                             │
│         [ CLEAR CART ]              [ CHECKOUT $14.46 ]     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Goods Receipt Form

```
┌─────────────────────────────────────────────────────────────┐
│  Receive Goods                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Product:     [Search or scan barcode...        ] [🔍]      │
│               Selected: Whole Milk 1L (MILK-001)            │
│                                                             │
│  Batch Number: [LOT-2026-003____________]                   │
│  Expiry Date:  [2026-03-15] 📅                              │
│  Quantity:     [200_______]                                 │
│  Cost/Unit:    [$1.50_____] (optional)                      │
│                                                             │
│  Notes:        [PO-12345 - Weekly delivery____]             │
│                                                             │
│         [ CANCEL ]                    [ RECEIVE GOODS ]     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Waste Entry Form

```
┌─────────────────────────────────────────────────────────────┐
│  Record Waste / Shrinkage                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Product:  [Search...                           ] [🔍]      │
│            Selected: Yogurt Strawberry (YOG-STR-001)        │
│                                                             │
│  Batch:    [▼ LOT-2026-001 (exp: Feb 10, qty: 15)  ]        │
│                                                             │
│  Quantity: [5________]                                      │
│                                                             │
│  Reason:   [▼ Expired                              ]        │
│            ○ Expired                                        │
│            ○ Damaged                                        │
│            ○ Theft                                          │
│            ○ Other (requires notes)                         │
│                                                             │
│  Notes:    [Found during morning shelf check____]           │
│                                                             │
│         [ CANCEL ]                    [ RECORD WASTE ]      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

[Next: Technical Stack →](./06-technical-stack.md)
