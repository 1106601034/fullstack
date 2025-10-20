# Database Patterns and Rules

**Priority: 🔴 CRITICAL**
**Applies to: Database Design, SQL, ORMs**

## Database Design Principles

### 1. Normalization
```sql
-- ✅ Good: Normalized structure
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  bio TEXT
);

-- ❌ Bad: Denormalized, duplicate data
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  bio TEXT,
  post1_title VARCHAR(255),
  post1_content TEXT,
  post2_title VARCHAR(255),
  post2_content TEXT
);
```

### 2. Indexing Strategy
```sql
-- ✅ Good: Strategic indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_posts_user_id_created_at ON posts(user_id, created_at DESC);

-- Composite index for common queries
CREATE INDEX idx_orders_user_status_created
ON orders(user_id, status, created_at DESC)
WHERE status IN ('pending', 'processing');

-- ❌ Bad: Over-indexing
CREATE INDEX idx_users_first_name ON users(first_name);
CREATE INDEX idx_users_last_name ON users(last_name);
CREATE INDEX idx_users_middle_name ON users(middle_name);
-- Too many indexes slow down writes
```

## Transaction Management

### 1. ACID Compliance
```typescript
// ✅ Good: Proper transaction handling
const transferFunds = async (
  fromAccount: string,
  toAccount: string,
  amount: number
): Promise<void> => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Debit source account
    const debitResult = await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2 AND balance >= $1 RETURNING balance',
      [amount, fromAccount]
    )

    if (debitResult.rowCount === 0) {
      throw new Error('Insufficient funds')
    }

    // Credit destination account
    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [amount, toAccount]
    )

    // Record transaction
    await client.query(
      'INSERT INTO transactions (from_account, to_account, amount) VALUES ($1, $2, $3)',
      [fromAccount, toAccount, amount]
    )

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
```

## Query Optimization

### 1. Efficient Queries
```typescript
// ✅ Good: Optimized queries
// Select only needed columns
const getUsers = async () => {
  return db.query(
    'SELECT id, name, email FROM users WHERE active = true'
  )
}

// Use LIMIT for pagination
const getPagedUsers = async (page: number, limit = 20) => {
  const offset = (page - 1) * limit
  return db.query(
    'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  )
}

// Batch operations
const updateMultipleUsers = async (updates: UserUpdate[]) => {
  const query = `
    UPDATE users AS u
    SET name = c.name, email = c.email
    FROM (VALUES ${updates.map((_, i) => `($${i*3+1}, $${i*3+2}, $${i*3+3})`).join(',')})
    AS c(id, name, email)
    WHERE u.id = c.id::uuid
  `
  const values = updates.flatMap(u => [u.id, u.name, u.email])
  return db.query(query, values)
}

// ❌ Bad: Inefficient queries
// N+1 problem
const getUsersWithPosts = async () => {
  const users = await db.query('SELECT * FROM users')
  for (const user of users) {
    user.posts = await db.query('SELECT * FROM posts WHERE user_id = $1', [user.id])
  }
  return users
}
```

### 2. Join Optimization
```sql
-- ✅ Good: Efficient joins
SELECT
  u.id,
  u.name,
  COUNT(p.id) as post_count,
  MAX(p.created_at) as last_post_date
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.active = true
GROUP BY u.id
HAVING COUNT(p.id) > 0
ORDER BY post_count DESC
LIMIT 10;

-- ❌ Bad: Inefficient subqueries
SELECT
  u.*,
  (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as post_count,
  (SELECT MAX(created_at) FROM posts WHERE user_id = u.id) as last_post
FROM users u
WHERE u.active = true;
```

## Data Integrity

### 1. Constraints
```sql
-- ✅ Good: Comprehensive constraints
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_category CHECK (category IN ('electronics', 'clothing', 'books'))
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status VARCHAR(20) DEFAULT 'pending',

  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'))
);
```

### 2. Audit Trail
```sql
-- ✅ Good: Audit logging
CREATE TABLE users_audit (
  audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation VARCHAR(10) NOT NULL,
  user_id UUID NOT NULL,
  changed_by UUID,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  old_values JSONB,
  new_values JSONB
);

CREATE OR REPLACE FUNCTION audit_users_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO users_audit(operation, user_id, old_values, changed_by)
    VALUES (TG_OP, OLD.id, to_jsonb(OLD), current_setting('app.current_user_id')::UUID);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO users_audit(operation, user_id, old_values, new_values, changed_by)
    VALUES (TG_OP, NEW.id, to_jsonb(OLD), to_jsonb(NEW), current_setting('app.current_user_id')::UUID);
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO users_audit(operation, user_id, new_values, changed_by)
    VALUES (TG_OP, NEW.id, to_jsonb(NEW), current_setting('app.current_user_id')::UUID);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION audit_users_changes();
```

## Migration Best Practices

### 1. Safe Migrations
```typescript
// ✅ Good: Reversible migrations
export async function up(knex: Knex): Promise<void> {
  // Add column with default
  await knex.schema.alterTable('users', table => {
    table.boolean('email_verified').defaultTo(false)
  })

  // Backfill data
  await knex('users').update({ email_verified: true })
    .whereNotNull('email_verified_at')

  // Add constraint after backfill
  await knex.raw(`
    ALTER TABLE users
    ADD CONSTRAINT email_verified_check
    CHECK (email_verified = true OR email_verified_at IS NULL)
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', table => {
    table.dropColumn('email_verified')
  })
}
```

### 2. Zero-Downtime Migrations
```sql
-- ✅ Good: Non-blocking operations
-- Step 1: Add column (fast)
ALTER TABLE users ADD COLUMN new_field VARCHAR(255);

-- Step 2: Backfill in batches (background job)
UPDATE users SET new_field = 'default'
WHERE new_field IS NULL AND id IN (
  SELECT id FROM users WHERE new_field IS NULL LIMIT 1000
);

-- Step 3: Add constraint after backfill
ALTER TABLE users ALTER COLUMN new_field SET NOT NULL;

-- ❌ Bad: Blocking operations
ALTER TABLE huge_table ADD COLUMN new_field VARCHAR(255) NOT NULL DEFAULT 'value';
-- This locks the entire table
```

## Connection Management

### 1. Connection Pooling
```typescript
// ✅ Good: Connection pool
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Use pool for queries
const getUser = async (id: string) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  )
  return result.rows[0]
}

// ❌ Bad: New connection per query
const getUser = async (id: string) => {
  const client = new Client({
    // connection config
  })
  await client.connect()
  const result = await client.query('SELECT * FROM users WHERE id = $1', [id])
  await client.end()
  return result.rows[0]
}
```

## Security Patterns

### 1. SQL Injection Prevention
```typescript
// ✅ Good: Parameterized queries
const getUser = async (email: string) => {
  return db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  )
}

// ❌ Bad: String concatenation
const getUser = async (email: string) => {
  return db.query(
    `SELECT * FROM users WHERE email = '${email}'` // SQL injection risk!
  )
}
```

### 2. Row Level Security
```sql
-- ✅ Good: RLS policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY documents_select ON documents
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY documents_insert ON documents
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY documents_update ON documents
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY documents_delete ON documents
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id')::UUID);
```

## Database Checklist

- [ ] Properly normalized schema
- [ ] Strategic indexes created
- [ ] Foreign key constraints defined
- [ ] Check constraints for data validation
- [ ] Transactions for atomic operations
- [ ] Connection pooling configured
- [ ] Parameterized queries only
- [ ] Audit logging implemented
- [ ] RLS policies defined
- [ ] Migrations are reversible
- [ ] Backup strategy in place
- [ ] Query performance monitored

## Remember

- **Normalize** until it hurts, denormalize until it works
- **Index** for reads, consider writes
- **Transaction** for consistency
- **Parameterize** always
- **Pool** connections
- **Audit** everything sensitive