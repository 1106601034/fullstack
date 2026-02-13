# 3. API Specification

[← Back to Index](./README.md) | [← Previous: Data Model](./02-data-model.md)

---

## 3.1 Authentication

All endpoints except `/api/auth/login` require a valid JWT token in the `Authorization` header.

```
Authorization: Bearer <token>
```

Tokens expire after 24 hours. Include user ID and role in the JWT payload.

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Authenticate user, return JWT | No |
| POST | `/api/auth/logout` | Invalidate token (optional) | Yes |
| GET | `/api/auth/me` | Get current user info | Yes |
| PUT | `/api/auth/password` | Change password | Yes |

**POST /api/auth/login**

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "manager"
  }
}
```

---

## 3.2 Products

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/products` | List products with filtering | All |
| GET | `/api/products/{id}` | Get single product with stock | All |
| POST | `/api/products` | Create product | Admin, Manager |
| PUT | `/api/products/{id}` | Update product | Admin, Manager |
| DELETE | `/api/products/{id}` | Soft delete product | Admin |
| GET | `/api/products/barcode/{barcode}` | Lookup by barcode | All |

**GET /api/products**

Query parameters:
- `search` (string): Search in name, SKU
- `category_id` (UUID): Filter by category
- `low_stock` (boolean): Only items below threshold
- `page` (int): Page number, default 1
- `limit` (int): Items per page, default 20, max 100

Response (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "sku": "MILK-001",
      "name": "Whole Milk 1L",
      "category": { "id": "uuid", "name": "Dairy" },
      "unit_of_measure": "pcs",
      "total_stock": 150,
      "low_stock_threshold": 20,
      "is_low_stock": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 1543,
    "total_pages": 78
  }
}
```

**GET /api/products/{id}**

Response includes barcodes and current batch information:
```json
{
  "id": "uuid",
  "sku": "MILK-001",
  "name": "Whole Milk 1L",
  "description": "Fresh whole milk",
  "category": { "id": "uuid", "name": "Dairy", "path": "Fresh Food > Dairy" },
  "unit_of_measure": "pcs",
  "low_stock_threshold": 20,
  "barcodes": [
    { "id": "uuid", "barcode": "5901234123457", "description": "Single", "quantity_per_scan": 1 },
    { "id": "uuid", "barcode": "5901234123464", "description": "6-pack", "quantity_per_scan": 6 }
  ],
  "stock_summary": {
    "total_on_hand": 150,
    "earliest_expiry": "2026-02-15",
    "batches": [
      { "id": "uuid", "batch_number": "LOT-2026-001", "expiry_date": "2026-02-15", "quantity_on_hand": 50 },
      { "id": "uuid", "batch_number": "LOT-2026-002", "expiry_date": "2026-02-20", "quantity_on_hand": 100 }
    ]
  }
}
```

**POST /api/products**

Request:
```json
{
  "sku": "MILK-001",
  "name": "Whole Milk 1L",
  "description": "Fresh whole milk",
  "category_id": "uuid",
  "unit_of_measure": "pcs",
  "low_stock_threshold": 20,
  "barcodes": [
    { "barcode": "5901234123457", "description": "Single", "quantity_per_scan": 1 }
  ]
}
```

---

## 3.3 Categories

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/categories` | List all categories (tree) | All |
| GET | `/api/categories/{id}` | Get single category | All |
| POST | `/api/categories` | Create category | Admin, Manager |
| PUT | `/api/categories/{id}` | Update category | Admin, Manager |
| DELETE | `/api/categories/{id}` | Delete category | Admin |

**GET /api/categories**

Response returns hierarchical tree:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Fresh Food",
      "children": [
        {
          "id": "uuid",
          "name": "Dairy",
          "children": [
            { "id": "uuid", "name": "Milk", "children": [] }
          ]
        }
      ]
    }
  ]
}
```

---

## 3.4 Inventory Operations

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/inventory/receive` | Record goods receipt | All |
| POST | `/api/inventory/adjust` | Manual adjustment | All |
| POST | `/api/inventory/waste` | Record shrinkage | All |
| GET | `/api/inventory/transactions` | Transaction history | Manager, Admin |
| GET | `/api/inventory/low-stock` | Items below threshold | All |
| GET | `/api/inventory/expiring` | Items expiring soon | All |

**POST /api/inventory/receive**

Record receipt of new inventory batch:
```json
{
  "product_id": "uuid",
  "batch_number": "LOT-2026-003",
  "expiry_date": "2026-03-15",
  "quantity": 200,
  "cost_per_unit": 1.50,
  "notes": "PO-12345"
}
```

Response (201):
```json
{
  "batch": {
    "id": "uuid",
    "batch_number": "LOT-2026-003",
    "quantity_on_hand": 200
  },
  "transaction": {
    "id": "uuid",
    "transaction_type": "receipt",
    "quantity": 200
  }
}
```

**POST /api/inventory/waste**

Record shrinkage:
```json
{
  "batch_id": "uuid",
  "quantity": 5,
  "reason_code": "expired",
  "notes": "Found during morning check"
}
```

**GET /api/inventory/expiring**

Query parameters:
- `days` (int): Items expiring within N days, default 3

Response:
```json
{
  "data": [
    {
      "product": { "id": "uuid", "sku": "MILK-001", "name": "Whole Milk 1L" },
      "batch": { "id": "uuid", "batch_number": "LOT-2026-001", "expiry_date": "2026-02-08" },
      "quantity_on_hand": 15,
      "days_until_expiry": 2
    }
  ]
}
```

---

## 3.5 Sales (POS Simulation)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/sales` | Process a sale | All |
| GET | `/api/sales/{id}` | Get sale details | All |
| POST | `/api/sales/{id}/void` | Void a sale | Manager, Admin |

**POST /api/sales**

Process sale with automatic FEFO stock deduction:
```json
{
  "items": [
    { "barcode": "5901234123457", "quantity": 2 },
    { "product_id": "uuid", "quantity": 1 }
  ]
}
```

The API will:
1. Look up products by barcode or ID
2. For each item, find batches ordered by expiry date (FEFO)
3. Deduct from oldest batch first, then next oldest if needed
4. Create inventory transactions
5. Return sale summary

Response (201):
```json
{
  "sale": {
    "id": "uuid",
    "sale_number": "S-20260206-001",
    "items": [
      {
        "product": { "id": "uuid", "name": "Whole Milk 1L" },
        "quantity": 2,
        "unit_price": 2.99,
        "subtotal": 5.98,
        "batches_used": [
          { "batch_id": "uuid", "batch_number": "LOT-2026-001", "quantity": 2 }
        ]
      }
    ],
    "total_amount": 5.98,
    "created_at": "2026-02-06T10:30:00Z"
  }
}
```

---

## 3.6 Reports

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/reports/low-stock` | Low stock report | Manager, Admin |
| GET | `/api/reports/expiring` | Expiring items report | Manager, Admin |
| GET | `/api/reports/shrinkage` | Shrinkage summary | Manager, Admin |
| GET | `/api/reports/inventory-value` | Current inventory valuation | Manager, Admin |

**GET /api/reports/shrinkage**

Query parameters:
- `start_date` (date): Period start
- `end_date` (date): Period end
- `reason_code` (string): Filter by reason

Response:
```json
{
  "period": { "start": "2026-01-01", "end": "2026-01-31" },
  "summary": {
    "total_units": 145,
    "estimated_value": 523.50,
    "by_reason": {
      "expired": { "units": 80, "value": 312.00 },
      "damaged": { "units": 45, "value": 156.50 },
      "theft": { "units": 20, "value": 55.00 }
    }
  },
  "top_products": [
    { "product": { "id": "uuid", "name": "Bananas" }, "units": 35, "value": 52.50 }
  ]
}
```

---

## 3.7 Users (Admin Only)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/users` | List users | Admin |
| POST | `/api/users` | Create user | Admin |
| PUT | `/api/users/{id}` | Update user | Admin |
| DELETE | `/api/users/{id}` | Deactivate user | Admin |

---

## 3.8 Error Responses

All errors follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      { "field": "quantity", "message": "Must be greater than 0" }
    ]
  }
}
```

**Standard error codes:**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Business rule violation (e.g., insufficient stock) |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

[Next: Functional Requirements →](./04-functional-requirements.md)
