# 2. Data Model

[← Back to Index](./README.md) | [← Previous: Overview](./01-overview.md)

---

## 2.1 Entity Relationship Overview

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

## 2.2 Entity Definitions

### Categories

Hierarchical product categorization (e.g., Fresh Food > Dairy > Milk).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Category name |
| parent_id | UUID | FK (self), NULL | Parent category for hierarchy |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

### Products

Master product information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| sku | VARCHAR(50) | UNIQUE, NOT NULL | Stock keeping unit |
| name | VARCHAR(200) | NOT NULL | Product name |
| description | TEXT | NULL | Product description |
| category_id | UUID | FK → Categories | Product category |
| unit_of_measure | ENUM | NOT NULL | 'pcs', 'kg', 'g', 'lbs', 'pack' |
| low_stock_threshold | INTEGER | NOT NULL, DEFAULT 10 | Alert threshold |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Soft delete flag |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

### Barcodes

Multiple barcodes can map to a single product (e.g., single item vs. multipack).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| product_id | UUID | FK → Products, NOT NULL | Parent product |
| barcode | VARCHAR(50) | UNIQUE, NOT NULL | Barcode value |
| description | VARCHAR(100) | NULL | e.g., "6-pack", "single" |
| quantity_per_scan | INTEGER | NOT NULL, DEFAULT 1 | Units per barcode scan |
| created_at | TIMESTAMP | NOT NULL | Record creation time |

### Batches

Tracks inventory at the batch level with expiry dates. This is the core of FEFO tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| product_id | UUID | FK → Products, NOT NULL | Parent product |
| batch_number | VARCHAR(50) | NOT NULL | Supplier batch/lot number |
| expiry_date | DATE | NULL | Expiration date (NULL if non-perishable) |
| quantity_received | INTEGER | NOT NULL | Original quantity received |
| quantity_on_hand | INTEGER | NOT NULL | Current available quantity |
| cost_per_unit | DECIMAL(10,2) | NULL | Unit cost for COGS calculation |
| received_at | TIMESTAMP | NOT NULL | When batch was received |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Index:** `(product_id, expiry_date)` for FEFO queries.

### InventoryTransactions

Immutable log of all inventory movements. This provides full audit trail and enables shrinkage analysis.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| batch_id | UUID | FK → Batches, NOT NULL | Affected batch |
| transaction_type | ENUM | NOT NULL | See transaction types below |
| quantity | INTEGER | NOT NULL | Positive = in, Negative = out |
| reason_code | VARCHAR(20) | NULL | For adjustments/waste |
| reference_id | VARCHAR(50) | NULL | PO number, sale ID, etc. |
| notes | TEXT | NULL | Additional context |
| performed_by | UUID | FK → Users, NOT NULL | User who performed action |
| created_at | TIMESTAMP | NOT NULL | Transaction timestamp |

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

### Users

System users with authentication and role assignment.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| name | VARCHAR(100) | NOT NULL | Display name |
| role | ENUM | NOT NULL | 'admin', 'manager', 'clerk' |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Account status |
| last_login_at | TIMESTAMP | NULL | Last successful login |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

### Sales (for POS simulation)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| sale_number | VARCHAR(20) | UNIQUE, NOT NULL | Human-readable sale ID |
| total_amount | DECIMAL(10,2) | NOT NULL | Sale total |
| status | ENUM | NOT NULL | 'completed', 'voided' |
| cashier_id | UUID | FK → Users, NOT NULL | Who processed the sale |
| created_at | TIMESTAMP | NOT NULL | Sale timestamp |

### SaleItems

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| sale_id | UUID | FK → Sales, NOT NULL | Parent sale |
| product_id | UUID | FK → Products, NOT NULL | Product sold |
| batch_id | UUID | FK → Batches, NOT NULL | Specific batch (for FEFO) |
| quantity | INTEGER | NOT NULL | Quantity sold |
| unit_price | DECIMAL(10,2) | NOT NULL | Price at time of sale |
| created_at | TIMESTAMP | NOT NULL | Record creation time |

---

[Next: API Specification →](./03-api-specification.md)
