# Product Requirement Document: SuperStock IMS

**Version:** 2.2
**Status:** Draft
**Date:** February 13, 2026
**Document Type:** Full-Stack Development Project Specification

-----

## Version History

|Version|Date        |Author|Changes                                                                                     |
|-------|------------|------|--------------------------------------------------------------------------------------------|
|1.0    |Feb 5, 2026 |—     |Initial draft                                                                               |
|2.0    |Feb 6, 2026 |—     |Revised for full-stack development project; added data model, API specs, implementation plan|
|2.1    |Feb 13, 2026|—     |Expanded tech stack: Serilog, TanStack Query, Vite, shadcn/ui, CI/CD, testing tools; removed implementation plan section|
|2.2    |Feb 13, 2026|—     |Updated architecture to Modular Monolith with Vertical Slices; added detailed project structure and feature organization|

-----

## 1. Project Overview

### 1.1 Purpose

**SuperStock** is a web-based inventory management system designed for supermarket operations. The system addresses two core problems: reducing shrinkage (spoilage, damage, theft) and optimizing stock rotation using First-Expired, First-Out (FEFO) logic.

This document serves as both a requirements specification and a development guide for building SuperStock as a full-stack application.

### 1.2 Goals

1. Track inventory with batch-level granularity and expiry dates
1. Automate FEFO logic when deducting stock from sales
1. Provide real-time visibility into low stock and expiring items
1. Record and categorize shrinkage for analysis
1. Demonstrate a production-quality full-stack architecture

### 1.3 Scope Definition

#### In Scope (MVP)

- Single-store inventory management
- Product and category management (CRUD)
- Multi-barcode support per product
- Batch tracking with expiry dates
- Goods receipt workflow
- POS simulation with FEFO-based stock deduction
- Shrinkage/waste logging
- Low stock and expiry alerts
- Basic reporting (low stock, expiring items, shrinkage summary)
- User authentication with role-based access
- Responsive web interface

#### Simulated (Not Real Integrations)

- POS system: Built-in simulation interface (no external POS integration)
- Scale integration: Manual weight entry (no hardware integration)
- Barcode scanning: Manual entry or camera-based scanning via browser

#### Out of Scope

- Multi-store/chain management
- Electronic Shelf Label (ESL) integration
- Mobile native app (web app will be mobile-responsive)
- Offline mode with sync
- Purchase order auto-generation
- Advanced analytics and forecasting
- Third-party accounting integration

### 1.4 Technical Constraints

- Development timeline: 8 weeks (adjustable)
- Team size: Solo developer or small team
- Infrastructure: Local Docker environment; cloud deployment optional

-----

## 2. User Roles and Permissions

### 2.1 Role Definitions

|Role       |Description                                                   |Typical User                  |
|-----------|--------------------------------------------------------------|------------------------------|
|**Admin**  |Full system access including user management and configuration|Store owner, IT administrator |
|**Manager**|Operational oversight, reporting, can approve adjustments     |Store manager, department head|
|**Clerk**  |Day-to-day operations: receiving, stocking, audits            |Stock clerk, warehouse staff  |

### 2.2 Permission Matrix

|Action                |Admin|Manager|Clerk|
|----------------------|:---:|:-----:|:---:|
|**Products**          |     |       |     |
|View products         |✓    |✓      |✓    |
|Create/edit products  |✓    |✓      |—    |
|Delete products       |✓    |—      |—    |
|**Inventory**         |     |       |     |
|View stock levels     |✓    |✓      |✓    |
|Receive goods         |✓    |✓      |✓    |
|Adjust inventory      |✓    |✓      |✓    |
|Record waste/shrinkage|✓    |✓      |✓    |
|**Sales (POS)**       |     |       |     |
|Process sales         |✓    |✓      |✓    |
|Void transactions     |✓    |✓      |—    |
|**Reports**           |     |       |     |
|View all reports      |✓    |✓      |—    |
|View basic alerts     |✓    |✓      |✓    |
|**Administration**    |     |       |     |
|Manage users          |✓    |—      |—    |
|System configuration  |✓    |—      |—    |
|View audit logs       |✓    |✓      |—    |

-----

## 3. Data Model

### 3.1 Entity Relationship Overview

```
Categories (self-referential hierarchy)
    │
    └── Products
            │
            ├── Barcodes (1:many)
            │
            └── Batches (1:many)
                    │
                    └── InventoryTransactions (1:many)

Users ──── InventoryTransactions (FK: performed_by)
```

### 3.2 Entity Definitions

#### Categories

Hierarchical product categorization (e.g., Fresh Food > Dairy > Milk).

|Column    |Type        |Constraints    |Description                  |
|----------|------------|---------------|-----------------------------|
|id        |UUID        |PK             |Unique identifier            |
|name      |VARCHAR(100)|NOT NULL       |Category name                |
|parent_id |UUID        |FK (self), NULL|Parent category for hierarchy|
|created_at|TIMESTAMP   |NOT NULL       |Record creation time         |
|updated_at|TIMESTAMP   |NOT NULL       |Last update time             |

#### Products

Master product information.

|Column             |Type        |Constraints           |Description                    |
|-------------------|------------|----------------------|-------------------------------|
|id                 |UUID        |PK                    |Unique identifier              |
|sku                |VARCHAR(50) |UNIQUE, NOT NULL      |Stock keeping unit             |
|name               |VARCHAR(200)|NOT NULL              |Product name                   |
|description        |TEXT        |NULL                  |Product description            |
|category_id        |UUID        |FK → Categories       |Product category               |
|unit_of_measure    |ENUM        |NOT NULL              |‘pcs’, ‘kg’, ‘g’, ‘lbs’, ‘pack’|
|low_stock_threshold|INTEGER     |NOT NULL, DEFAULT 10  |Alert threshold                |
|is_active          |BOOLEAN     |NOT NULL, DEFAULT true|Soft delete flag               |
|created_at         |TIMESTAMP   |NOT NULL              |Record creation time           |
|updated_at         |TIMESTAMP   |NOT NULL              |Last update time               |

#### Barcodes

Multiple barcodes can map to a single product (e.g., single item vs. multipack).

|Column           |Type        |Constraints            |Description             |
|-----------------|------------|-----------------------|------------------------|
|id               |UUID        |PK                     |Unique identifier       |
|product_id       |UUID        |FK → Products, NOT NULL|Parent product          |
|barcode          |VARCHAR(50) |UNIQUE, NOT NULL       |Barcode value           |
|description      |VARCHAR(100)|NULL                   |e.g., “6-pack”, “single”|
|quantity_per_scan|INTEGER     |NOT NULL, DEFAULT 1    |Units per barcode scan  |
|created_at       |TIMESTAMP   |NOT NULL               |Record creation time    |

#### Batches

Tracks inventory at the batch level with expiry dates. This is the core of FEFO tracking.

|Column           |Type         |Constraints            |Description                             |
|-----------------|-------------|-----------------------|----------------------------------------|
|id               |UUID         |PK                     |Unique identifier                       |
|product_id       |UUID         |FK → Products, NOT NULL|Parent product                          |
|batch_number     |VARCHAR(50)  |NOT NULL               |Supplier batch/lot number               |
|expiry_date      |DATE         |NULL                   |Expiration date (NULL if non-perishable)|
|quantity_received|INTEGER      |NOT NULL               |Original quantity received              |
|quantity_on_hand |INTEGER      |NOT NULL               |Current available quantity              |
|cost_per_unit    |DECIMAL(10,2)|NULL                   |Unit cost for COGS calculation          |
|received_at      |TIMESTAMP    |NOT NULL               |When batch was received                 |
|created_at       |TIMESTAMP    |NOT NULL               |Record creation time                    |
|updated_at       |TIMESTAMP    |NOT NULL               |Last update time                        |

**Index:** `(product_id, expiry_date)` for FEFO queries.

#### InventoryTransactions

Immutable log of all inventory movements. This provides full audit trail and enables shrinkage analysis.

|Column          |Type       |Constraints           |Description                  |
|----------------|-----------|----------------------|-----------------------------|
|id              |UUID       |PK                    |Unique identifier            |
|batch_id        |UUID       |FK → Batches, NOT NULL|Affected batch               |
|transaction_type|ENUM       |NOT NULL              |See transaction types below  |
|quantity        |INTEGER    |NOT NULL              |Positive = in, Negative = out|
|reason_code     |VARCHAR(20)|NULL                  |For adjustments/waste        |
|reference_id    |VARCHAR(50)|NULL                  |PO number, sale ID, etc.     |
|notes           |TEXT       |NULL                  |Additional context           |
|performed_by    |UUID       |FK → Users, NOT NULL  |User who performed action    |
|created_at      |TIMESTAMP  |NOT NULL              |Transaction timestamp        |

**Transaction Types:**

- `receipt` — Goods received into inventory
- `sale` — Stock sold via POS
- `adjustment` — Manual correction (positive or negative)
- `waste` — Shrinkage recorded
- `return` — Customer return

**Reason Codes (for waste/adjustment):**

- `expired` — Past sell-by date
- `damaged` — Physical damage
- `theft` — Known or suspected theft
- `vendor_return` — Returned to supplier
- `admin_error` — Data entry correction
- `sampling` — Used for demos/tastings
- `donation` — Given to charity
- `other` — Requires notes

#### Users

System users with authentication and role assignment.

|Column       |Type        |Constraints           |Description                |
|-------------|------------|----------------------|---------------------------|
|id           |UUID        |PK                    |Unique identifier          |
|email        |VARCHAR(255)|UNIQUE, NOT NULL      |Login email                |
|password_hash|VARCHAR(255)|NOT NULL              |Bcrypt hashed password     |
|name         |VARCHAR(100)|NOT NULL              |Display name               |
|role         |ENUM        |NOT NULL              |‘admin’, ‘manager’, ‘clerk’|
|is_active    |BOOLEAN     |NOT NULL, DEFAULT true|Account status             |
|last_login_at|TIMESTAMP   |NULL                  |Last successful login      |
|created_at   |TIMESTAMP   |NOT NULL              |Record creation time       |
|updated_at   |TIMESTAMP   |NOT NULL              |Last update time           |

#### Sales (Optional — for POS simulation)

|Column      |Type         |Constraints         |Description           |
|------------|-------------|--------------------|----------------------|
|id          |UUID         |PK                  |Unique identifier     |
|sale_number |VARCHAR(20)  |UNIQUE, NOT NULL    |Human-readable sale ID|
|total_amount|DECIMAL(10,2)|NOT NULL            |Sale total            |
|status      |ENUM         |NOT NULL            |‘completed’, ‘voided’ |
|cashier_id  |UUID         |FK → Users, NOT NULL|Who processed the sale|
|created_at  |TIMESTAMP    |NOT NULL            |Sale timestamp        |

#### SaleItems

|Column    |Type         |Constraints            |Description              |
|----------|-------------|-----------------------|-------------------------|
|id        |UUID         |PK                     |Unique identifier        |
|sale_id   |UUID         |FK → Sales, NOT NULL   |Parent sale              |
|product_id|UUID         |FK → Products, NOT NULL|Product sold             |
|batch_id  |UUID         |FK → Batches, NOT NULL |Specific batch (for FEFO)|
|quantity  |INTEGER      |NOT NULL               |Quantity sold            |
|unit_price|DECIMAL(10,2)|NOT NULL               |Price at time of sale    |
|created_at|TIMESTAMP    |NOT NULL               |Record creation time     |

-----

## 4. API Specification

### 4.1 Authentication

All endpoints except `/api/auth/login` require a valid JWT token in the `Authorization` header.

```
Authorization: Bearer <token>
```

Tokens expire after 24 hours. Include user ID and role in the JWT payload.

#### Endpoints

|Method|Endpoint            |Description                  |Auth|
|------|--------------------|-----------------------------|----|
|POST  |`/api/auth/login`   |Authenticate user, return JWT|No  |
|POST  |`/api/auth/logout`  |Invalidate token (optional)  |Yes |
|GET   |`/api/auth/me`      |Get current user info        |Yes |
|PUT   |`/api/auth/password`|Change password              |Yes |

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

### 4.2 Products

|Method|Endpoint                         |Description                  |Roles         |
|------|---------------------------------|-----------------------------|--------------|
|GET   |`/api/products`                  |List products with filtering |All           |
|GET   |`/api/products/{id}`             |Get single product with stock|All           |
|POST  |`/api/products`                  |Create product               |Admin, Manager|
|PUT   |`/api/products/{id}`             |Update product               |Admin, Manager|
|DELETE|`/api/products/{id}`             |Soft delete product          |Admin         |
|GET   |`/api/products/barcode/{barcode}`|Lookup by barcode            |All           |

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

### 4.3 Categories

|Method|Endpoint              |Description               |Roles         |
|------|----------------------|--------------------------|--------------|
|GET   |`/api/categories`     |List all categories (tree)|All           |
|GET   |`/api/categories/{id}`|Get single category       |All           |
|POST  |`/api/categories`     |Create category           |Admin, Manager|
|PUT   |`/api/categories/{id}`|Update category           |Admin, Manager|
|DELETE|`/api/categories/{id}`|Delete category           |Admin         |

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

### 4.4 Inventory Operations

|Method|Endpoint                     |Description          |Roles         |
|------|-----------------------------|---------------------|--------------|
|POST  |`/api/inventory/receive`     |Record goods receipt |All           |
|POST  |`/api/inventory/adjust`      |Manual adjustment    |All           |
|POST  |`/api/inventory/waste`       |Record shrinkage     |All           |
|GET   |`/api/inventory/transactions`|Transaction history  |Manager, Admin|
|GET   |`/api/inventory/low-stock`   |Items below threshold|All           |
|GET   |`/api/inventory/expiring`    |Items expiring soon  |All           |

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

### 4.5 Sales (POS Simulation)

|Method|Endpoint              |Description     |Roles         |
|------|----------------------|----------------|--------------|
|POST  |`/api/sales`          |Process a sale  |All           |
|GET   |`/api/sales/{id}`     |Get sale details|All           |
|POST  |`/api/sales/{id}/void`|Void a sale     |Manager, Admin|

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
1. For each item, find batches ordered by expiry date (FEFO)
1. Deduct from oldest batch first, then next oldest if needed
1. Create inventory transactions
1. Return sale summary

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

### 4.6 Reports

|Method|Endpoint                      |Description                |Roles         |
|------|------------------------------|---------------------------|--------------|
|GET   |`/api/reports/low-stock`      |Low stock report           |Manager, Admin|
|GET   |`/api/reports/expiring`       |Expiring items report      |Manager, Admin|
|GET   |`/api/reports/shrinkage`      |Shrinkage summary          |Manager, Admin|
|GET   |`/api/reports/inventory-value`|Current inventory valuation|Manager, Admin|

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

### 4.7 Users (Admin Only)

|Method|Endpoint         |Description    |Roles|
|------|-----------------|---------------|-----|
|GET   |`/api/users`     |List users     |Admin|
|POST  |`/api/users`     |Create user    |Admin|
|PUT   |`/api/users/{id}`|Update user    |Admin|
|DELETE|`/api/users/{id}`|Deactivate user|Admin|

### 4.8 Error Responses

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

Standard error codes:

- `VALIDATION_ERROR` (400): Invalid request data
- `UNAUTHORIZED` (401): Missing or invalid token
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Business rule violation (e.g., insufficient stock)
- `INTERNAL_ERROR` (500): Unexpected server error

-----

## 5. Functional Requirements

### 5.1 Product Management

|ID   |Requirement                                   |Priority|
|-----|----------------------------------------------|--------|
|PM-01|Create, read, update, soft-delete products    |P0      |
|PM-02|Assign products to hierarchical categories    |P0      |
|PM-03|Support multiple barcodes per product         |P0      |
|PM-04|Define unit of measure (pcs, kg, g, lbs, pack)|P0      |
|PM-05|Set low stock threshold per product           |P0      |
|PM-06|Search products by name, SKU, barcode         |P0      |
|PM-07|Filter products by category                   |P1      |
|PM-08|Bulk import products via CSV                  |P2      |

### 5.2 Batch and Expiry Tracking

|ID   |Requirement                                         |Priority|
|-----|----------------------------------------------------|--------|
|BT-01|Track inventory at batch level                      |P0      |
|BT-02|Record expiry date per batch                        |P0      |
|BT-03|Record batch/lot number for traceability            |P0      |
|BT-04|Support non-perishable items (no expiry)            |P0      |
|BT-05|Display batches ordered by expiry (FEFO)            |P0      |
|BT-06|Alert on items expiring within N days (configurable)|P0      |

### 5.3 Inventory Operations

|ID   |Requirement                               |Priority|
|-----|------------------------------------------|--------|
|IO-01|Record goods receipt with batch details   |P0      |
|IO-02|Automatic FEFO deduction on sales         |P0      |
|IO-03|Manual inventory adjustment with reason   |P0      |
|IO-04|Record waste/shrinkage with categorization|P0      |
|IO-05|View transaction history per product/batch|P0      |
|IO-06|Display current stock with batch breakdown|P0      |
|IO-07|Low stock alert list                      |P0      |
|IO-08|Prevent negative inventory (validation)   |P0      |

### 5.4 FEFO Logic (Detailed)

When stock is deducted (sale or waste), the system must:

1. Query all batches for the product with `quantity_on_hand > 0`
1. Order batches by `expiry_date ASC` (NULL expiry dates come last)
1. Deduct from the first (oldest) batch
1. If quantity exceeds first batch, continue to next batch
1. Record transaction(s) for each batch affected
1. Fail with error if total available stock is insufficient

**Example:**

- Product: Milk
- Batches: A (exp: Feb 10, qty: 5), B (exp: Feb 15, qty: 20)
- Sale quantity: 8

Result:

- Deduct 5 from Batch A (now 0)
- Deduct 3 from Batch B (now 17)
- Create 2 inventory transactions

### 5.5 POS Simulation

|ID    |Requirement                         |Priority|
|------|------------------------------------|--------|
|POS-01|Scan/enter barcode to add item      |P0      |
|POS-02|Display product name and price      |P0      |
|POS-03|Adjust quantity in cart             |P0      |
|POS-04|Remove item from cart               |P0      |
|POS-05|Calculate and display total         |P0      |
|POS-06|Complete sale (checkout)            |P0      |
|POS-07|Void completed sale (manager only)  |P1      |
|POS-08|Handle insufficient stock gracefully|P0      |

### 5.6 Shrinkage Recording

|ID   |Requirement                                                                                         |Priority|
|-----|----------------------------------------------------------------------------------------------------|--------|
|SH-01|Record waste with quantity and reason                                                               |P0      |
|SH-02|Support reason codes: expired, damaged, theft, vendor_return, admin_error, sampling, donation, other|P0      |
|SH-03|Require notes for “other” reason                                                                    |P0      |
|SH-04|Select specific batch when recording                                                                |P0      |
|SH-05|Calculate estimated value lost                                                                      |P1      |

### 5.7 Reporting

|ID   |Requirement                              |Priority|
|-----|-----------------------------------------|--------|
|RP-01|Low stock report                         |P0      |
|RP-02|Expiring items report (configurable days)|P0      |
|RP-03|Shrinkage summary by reason and period   |P1      |
|RP-04|Inventory valuation report               |P2      |
|RP-05|Export reports to CSV                    |P2      |

### 5.8 User Management

|ID   |Requirement                           |Priority|
|-----|--------------------------------------|--------|
|UM-01|User login with email/password        |P0      |
|UM-02|JWT-based session management          |P0      |
|UM-03|Role-based access control (RBAC)      |P0      |
|UM-04|Admin can create/edit/deactivate users|P0      |
|UM-05|Users can change own password         |P1      |
|UM-06|Audit log of user actions             |P2      |

-----

## 6. User Interface

### 6.1 Screen List

|Screen                |Description                     |Primary Users |
|----------------------|--------------------------------|--------------|
|Login                 |Authentication form             |All           |
|Dashboard             |Overview with alerts and metrics|Manager, Admin|
|Product List          |Searchable product table        |All           |
|Product Detail        |View/edit product with batches  |Manager, Admin|
|Product Create        |New product form                |Manager, Admin|
|Category Manager      |Category tree CRUD              |Manager, Admin|
|Goods Receipt         |Form to receive inventory       |Clerk, Manager|
|POS Interface         |Simulated checkout              |All           |
|Waste Entry           |Record shrinkage form           |All           |
|Inventory Transactions|Transaction history table       |Manager, Admin|
|Low Stock Alert       |Filtered product list           |All           |
|Expiring Items        |Items expiring within N days    |All           |
|Shrinkage Report      |Summary and breakdown           |Manager, Admin|
|User Management       |User CRUD (admin only)          |Admin         |

### 6.2 UX Requirements

These requirements address the operational environment (warehouse/store floor):

|ID   |Requirement                                      |Rationale                                       |
|-----|-------------------------------------------------|------------------------------------------------|
|UX-01|High contrast color scheme                       |Visibility under bright warehouse lighting      |
|UX-02|Minimum touch target size: 44x44px               |Usability with gloves or on mobile              |
|UX-03|Clear visual feedback for actions (success/error)|Confirmation without audio in noisy environments|
|UX-04|Keyboard navigation support                      |Speed for desktop users                         |
|UX-05|Mobile-responsive layout                         |Tablet use during receiving/audits              |
|UX-06|Loading states for async operations              |User awareness during API calls                 |
|UX-07|Confirmation dialogs for destructive actions     |Prevent accidental deletions                    |

### 6.3 Key Screen Wireframes (Conceptual)

#### Dashboard

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

#### POS Interface

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

-----

## 7. Technical Stack

### 7.1 Backend - Core

|Component        |Technology           |Version|
|-----------------|---------------------|-------|
|Framework        |ASP.NET Core Web API |8.0    |
|Language         |C#                   |12     |
|ORM              |Entity Framework Core|8.0    |
|Database         |PostgreSQL           |16     |
|Authentication   |JWT Bearer Tokens    |—      |
|Password Hashing |BCrypt               |—      |
|API Documentation|Swagger / OpenAPI    |3.0    |
|Validation       |FluentValidation     |—      |
|Mapping          |AutoMapper           |—      |

### 7.2 Backend - Architecture

#### Architecture Decision: Modular Monolith with Vertical Slices

For an IMS where **data consistency is critical** (stock accuracy, FEFO calculations), we use a hybrid approach that balances simplicity with scalability.

|Component            |Technology                    |Purpose                                      |
|---------------------|------------------------------|---------------------------------------------|
|Architecture Pattern |Modular Monolith + Vertical Slices|High cohesion, easy extraction to microservices|
|Mediator             |MediatR                       |Decouple request handlers, CQRS-lite         |
|Module Communication |In-process method calls       |Modules interact via public APIs only        |
|Dependency Rule      |Clean Architecture principles |Business logic independent of infrastructure |

#### Why This Approach?

| Architecture | Pros | Cons |
|--------------|------|------|
| **Clean Architecture (Strict)** | Excellent testability; decoupled layers | Verbose; simple CRUD requires too much boilerplate |
| **Vertical Slices** | High cohesion; all code for a feature in one place | Can become spaghetti without layering rules |
| **Microservices** | Independent scaling | Distributed transactions complexity; kills ACID for inventory |
| **Modular Monolith + Slices** ✅ | Best of both; single deployment; easy future extraction | Requires discipline to maintain boundaries |

#### Project Structure (Modular Monolith with Vertical Slices)

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
│   │   ├── Domain/                    → Batch, InventoryTransaction entities
│   │   ├── Data/
│   │   └── InventoryModule.cs
│   │
│   ├── Sales/                         → POS, transactions
│   │   ├── Features/
│   │   │   ├── ProcessSale/
│   │   │   ├── VoidSale/
│   │   │   └── GetSale/
│   │   ├── Domain/                    → Sale, SaleItem entities
│   │   ├── Data/
│   │   └── SalesModule.cs
│   │
│   ├── Users/                         → Authentication, authorization
│   │   ├── Features/
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   └── ChangePassword/
│   │   ├── Domain/                    → User entity
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

#### Vertical Slice Example: AdjustStock Feature

```
Modules/Inventory/Features/AdjustStock/
├── AdjustStockEndpoint.cs      → POST /api/inventory/adjust
├── AdjustStockCommand.cs       → Request DTO with validation
├── AdjustStockHandler.cs       → Business logic (FEFO, transactions)
├── AdjustStockValidator.cs     → FluentValidation rules
└── AdjustStockResponse.cs      → Response DTO
```

**Key Principles:**
1. **Module Isolation**: Modules only communicate via public interfaces, never access each other's database tables directly
2. **Feature Cohesion**: All code for a use case lives together—endpoint, command, handler, validation
3. **Dependency Rule**: Handlers don't depend on endpoints; repositories implement interfaces defined by business logic
4. **Future-Proof**: Any module can be extracted to a microservice if scaling demands it

### 7.3 Backend - Logging & Observability

|Component        |Technology                    |Purpose                        |
|-----------------|------------------------------|-------------------------------|
|Structured Logging|Serilog                      |Rich, queryable logs           |
|Log Sinks        |Console + File + Seq (optional)|Log output destinations        |
|Health Checks    |AspNetCore.Diagnostics.HealthChecks|Monitor DB, dependencies      |
|Correlation IDs  |Serilog.Enrichers             |Trace requests across services |

### 7.4 Backend - Resilience & Performance

|Component          |Technology                     |Purpose                        |
|-------------------|-------------------------------|-------------------------------|
|Retry Policies     |Polly                          |Handle transient failures      |
|Circuit Breaker    |Polly                          |Fail fast on repeated errors   |
|Caching            |IMemoryCache                   |Reduce DB load for hot data    |
|Rate Limiting      |AspNetCore.RateLimiting        |API protection                 |
|Response Compression|Built-in middleware           |Reduce payload sizes           |

### 7.5 Backend - Background Processing

|Component        |Technology        |Purpose                              |
|-----------------|------------------|-------------------------------------|
|Scheduled Jobs   |Hangfire          |Expiry alerts, cleanup, reports      |
|Background Tasks |IHostedService    |Long-running async operations        |
|Job Dashboard    |Hangfire.Dashboard|Monitor and manage jobs              |

### 7.6 Frontend - Core

|Component       |Technology                |Version|
|----------------|--------------------------|-------|
|Framework       |React                     |18     |
|Language        |TypeScript                |5.x    |
|Build Tool      |Vite                      |5.x    |
|Routing         |React Router              |6      |
|Styling         |Tailwind CSS              |3.x    |
|Icons           |Lucide React              |—      |

### 7.7 Frontend - State & Data

|Component        |Technology          |Purpose                              |
|-----------------|--------------------|-------------------------------------|
|Server State     |TanStack Query      |API caching, refetching, mutations   |
|Client State     |React Context + useReducer|Local UI state (auth, theme)   |
|Forms            |React Hook Form     |Form state and validation            |
|Schema Validation|Zod                 |Runtime validation + TypeScript types|
|Tables           |TanStack Table      |Headless table logic                 |

### 7.8 Frontend - UI Components

|Component        |Technology          |Purpose                              |
|-----------------|--------------------|-------------------------------------|
|Component Library|shadcn/ui           |Accessible, customizable components  |
|Primitives       |Radix UI            |Unstyled accessible primitives       |
|Notifications    |Sonner              |Toast notifications                  |
|Class Utilities  |clsx + tailwind-merge|Conditional class management        |
|Date Handling    |date-fns            |Lightweight date formatting          |

### 7.9 Infrastructure

|Component         |Technology                         |Purpose                    |
|------------------|-----------------------------------|---------------------------|
|Containerization  |Docker + Docker Compose            |Consistent environments    |
|Database Container|postgres:16-alpine                 |Lightweight PostgreSQL     |
|API Container     |mcr.microsoft.com/dotnet/aspnet:8.0|Production .NET runtime    |
|Reverse Proxy     |nginx                              |SSL termination, routing   |
|Local Development |Docker Compose with hot reload     |Fast development iteration |

### 7.10 CI/CD & Quality

|Component        |Technology          |Purpose                              |
|-----------------|--------------------|-------------------------------------|
|CI/CD Pipeline   |GitHub Actions      |Automated build, test, deploy        |
|Code Quality     |StyleCop.Analyzers  |C# code style enforcement            |
|Linting (Frontend)|ESLint + Prettier  |JS/TS code quality                   |
|Unit Testing (BE)|xUnit + Moq         |Backend unit tests                   |
|Unit Testing (FE)|Vitest              |Fast frontend unit tests             |
|E2E Testing      |Playwright          |End-to-end user flow tests           |
|Test Data        |Bogus               |Generate realistic fake data         |
|DB Testing       |Testcontainers      |Real PostgreSQL in integration tests |
|Assertions       |FluentAssertions    |Readable test assertions             |

### 7.11 Development Tools

|Purpose          |Tool                                  |
|-----------------|--------------------------------------|
|Backend IDE      |Visual Studio / VS Code + C# extension|
|Frontend IDE     |VS Code                               |
|API Testing      |Postman or Thunder Client             |
|Database GUI     |pgAdmin or DBeaver                    |
|Version Control  |Git                                   |
|Editor Config    |.editorconfig                         |
|Git Hooks        |Husky (frontend)                      |

-----

## 8. Non-Functional Requirements

### 8.1 Performance

|Metric                 |Target       |Notes                     |
|-----------------------|-------------|--------------------------|
|Barcode lookup response|< 200ms (P95)|Critical for POS usability|
|Product list load      |< 500ms (P95)|With pagination           |
|Sale processing        |< 1 second   |Including FEFO calculation|
|Report generation      |< 3 seconds  |For standard date ranges  |

### 8.2 Scalability Targets

For this development project, design for:

- 10,000 - 50,000 SKUs
- 100,000+ batches
- 1,000,000+ transactions (historical)
- 10 concurrent users

### 8.3 Security

|Requirement             |Implementation                         |
|------------------------|---------------------------------------|
|Password storage        |BCrypt with cost factor 12             |
|Authentication          |JWT with 24-hour expiry                |
|Authorization           |Role-based middleware                  |
|Input validation        |Server-side validation on all endpoints|
|SQL injection prevention|Parameterized queries via EF Core      |
|XSS prevention          |React’s default escaping + CSP headers |

### 8.4 Data Integrity

|Requirement          |Implementation                      |
|---------------------|------------------------------------|
|Referential integrity|Foreign key constraints             |
|Concurrent updates   |Optimistic concurrency (row version)|
|Audit trail          |Immutable transaction log           |
|Soft deletes         |`is_active` flags, no hard deletes  |

-----

## 9. Testing Strategy

### 9.1 Backend Testing

|Type             |Scope                           |Tools                       |
|-----------------|--------------------------------|----------------------------|
|Unit Tests       |Business logic, FEFO algorithm  |xUnit, Moq                  |
|Integration Tests|API endpoints with test database|xUnit, WebApplicationFactory|

**Priority test cases:**

- FEFO deduction with multiple batches
- FEFO with mixed expiry and non-expiry items
- Insufficient stock handling
- Role-based access control

### 9.2 Frontend Testing

|Type             |Scope                |Tools                |
|-----------------|---------------------|---------------------|
|Component Tests  |Individual components|React Testing Library|
|Integration Tests|User flows           |React Testing Library|

**Priority test cases:**

- Login flow
- POS checkout flow
- Goods receipt submission

### 9.3 Manual Testing

- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile responsiveness (iOS Safari, Android Chrome)
- Accessibility testing (keyboard navigation, screen reader)

-----

## 10. Glossary

|Term         |Definition                                                                          |
|-------------|------------------------------------------------------------------------------------|
|**Batch**    |A specific lot of inventory received at one time, with its own expiry date          |
|**COGS**     |Cost of Goods Sold; the direct cost of producing/purchasing items sold              |
|**FEFO**     |First-Expired, First-Out; inventory rotation method prioritizing oldest expiry dates|
|**FMCG**     |Fast-Moving Consumer Goods; products that sell quickly at low cost                  |
|**JWT**      |JSON Web Token; compact token format for authentication                             |
|**POS**      |Point of Sale; system where retail transactions occur                               |
|**RBAC**     |Role-Based Access Control; permissions based on user roles                          |
|**Shrinkage**|Inventory loss due to theft, damage, spoilage, or administrative error              |
|**SKU**      |Stock Keeping Unit; unique identifier for a product                                 |
|**UoM**      |Unit of Measure; how a product is counted (pieces, kg, etc.)                        |

-----

## 11. Future Enhancements

Features to consider for future versions:

1. **Purchase Order Management** — Auto-generate POs based on sales velocity
1. **Mobile Native App** — React Native with offline sync
1. **Multi-Store Support** — Chain management with inter-store transfers
1. **Supplier Management** — Vendor database with lead times
1. **Barcode Printing** — Generate labels for batches
1. **Advanced Analytics** — Sales forecasting, seasonal trends
1. **ESL Integration** — Push prices to electronic shelf labels
1. **API for External POS** — Allow real POS systems to integrate

-----

*End of Document*
