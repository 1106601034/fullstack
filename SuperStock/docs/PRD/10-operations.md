# 10. Operations & Maintenance

[← Back to Index](./README.md) | [← Previous: Deployment](./09-deployment.md)

---

## 10.1 Monitoring

### Health Check Endpoints

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `GET /health` | Overall health | 200 OK |
| `GET /health/ready` | Ready to serve traffic | 200 OK |
| `GET /health/live` | Application is running | 200 OK |
| `GET /health/db` | Database connectivity | 200 OK |
| `GET /health/redis` | Redis connectivity | 200 OK |

### Health Check Implementation

```csharp
// Program.cs
builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString, name: "database")
    .AddRedis(redisConnectionString, name: "redis")
    .AddCheck<HangfireHealthCheck>("hangfire");

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false // Just checks if app is running
});
```

### Monitoring Stack (Recommended)

| Component | Tool | Purpose |
|-----------|------|---------|
| Metrics | Prometheus + Grafana | Performance metrics |
| Logging | Seq or ELK Stack | Log aggregation |
| Tracing | Jaeger or Zipkin | Distributed tracing |
| Alerts | Grafana Alerting | Incident notification |

### Key Metrics to Monitor

| Metric | Warning | Critical |
|--------|---------|----------|
| API Response Time (P95) | > 500ms | > 1s |
| Error Rate | > 1% | > 5% |
| Database Connection Pool | > 80% used | > 95% used |
| Redis Memory Usage | > 200MB | > 240MB |
| Redis Connected Clients | > 50 | > 80 |
| Cache Hit Rate | < 80% | < 60% |
| Memory Usage | > 80% | > 95% |
| CPU Usage | > 70% | > 90% |
| Disk Space | < 20% free | < 10% free |

---

## 10.2 Logging

### Log Levels

| Level | Usage | Example |
|-------|-------|---------|
| **Debug** | Development only | Variable values, flow tracing |
| **Information** | Normal operations | User login, sale completed |
| **Warning** | Potential issues | Low stock alert, slow query |
| **Error** | Failures | API error, DB connection failed |
| **Fatal** | Application crash | Unhandled exception |

### Serilog Configuration

```json
// appsettings.json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "Microsoft.EntityFrameworkCore": "Warning"
      }
    },
    "WriteTo": [
      { "Name": "Console" },
      {
        "Name": "File",
        "Args": {
          "path": "logs/superstock-.log",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 30
        }
      },
      {
        "Name": "Seq",
        "Args": { "serverUrl": "http://seq:5341" }
      }
    ],
    "Enrich": ["FromLogContext", "WithMachineName", "WithThreadId"]
  }
}
```

### Structured Log Examples

```csharp
// Good - Structured with context
_logger.LogInformation(
    "Sale {SaleId} processed for {ItemCount} items, total {TotalAmount}",
    sale.Id, sale.Items.Count, sale.TotalAmount);

// Good - Error with exception
_logger.LogError(ex,
    "Failed to process sale for user {UserId}",
    userId);

// Bad - String interpolation (loses structure)
_logger.LogInformation($"Sale {sale.Id} processed"); // Don't do this
```

---

## 10.3 Backup & Recovery

### Database Backup Strategy

| Type | Frequency | Retention |
|------|-----------|-----------|
| Full backup | Daily | 30 days |
| Transaction log | Every 15 min | 7 days |
| Point-in-time | Continuous | 7 days |

### Backup Scripts

```bash
#!/bin/bash
# backup.sh - Daily backup script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/superstock"
DB_NAME="superstock"

# Create backup
docker exec superstock-db pg_dump -U superstock $DB_NAME | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Upload to S3 (optional)
aws s3 cp "$BACKUP_DIR/backup_$DATE.sql.gz" s3://your-bucket/backups/
```

### Restore Procedure

```bash
# Stop application
docker-compose stop api

# Restore from backup
gunzip -c backup_20260213.sql.gz | docker exec -i superstock-db psql -U superstock superstock

# Restart application
docker-compose start api

# Verify data integrity
curl http://localhost:5000/health/db
```

### Disaster Recovery Plan

1. **RTO (Recovery Time Objective)**: 4 hours
2. **RPO (Recovery Point Objective)**: 15 minutes

| Scenario | Action | Time |
|----------|--------|------|
| Database corruption | Restore from latest backup | 1-2 hours |
| Server failure | Deploy to new server | 2-4 hours |
| Data center outage | Failover to secondary region | 4-8 hours |

---

## 10.4 Background Jobs

### Scheduled Jobs

| Job | Schedule | Purpose |
|-----|----------|---------|
| `ExpiryAlertJob` | Daily 6:00 AM | Alert on items expiring in 3 days |
| `LowStockAlertJob` | Every 4 hours | Alert on low stock items |
| `CleanupOldLogsJob` | Daily 2:00 AM | Remove logs older than 90 days |
| `DatabaseMaintenanceJob` | Weekly Sunday 3:00 AM | VACUUM, reindex |
| `ReportGenerationJob` | Daily 11:59 PM | Generate daily reports |

### Hangfire Dashboard

Access at: `https://yourdomain.com/hangfire`

**Dashboard Features:**
- View job history
- Retry failed jobs
- Monitor recurring jobs
- View job queues

### Monitoring Failed Jobs

```csharp
// Alert on repeated failures
public class JobFailureNotifier : IJobFilterProvider
{
    public void OnStateApplied(ApplyStateContext context, IWriteOnlyTransaction transaction)
    {
        if (context.NewState is FailedState failedState)
        {
            var retryCount = context.GetJobParameter<int>("RetryCount");
            if (retryCount >= 3)
            {
                _alertService.SendAlert($"Job {context.JobId} failed {retryCount} times");
            }
        }
    }
}
```

---

## 10.5 Performance Tuning

### Database Optimization

```sql
-- Check slow queries
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check index usage
SELECT indexrelname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_batches_product_expiry
ON batches(product_id, expiry_date)
WHERE quantity_on_hand > 0;

-- Regular maintenance
VACUUM ANALYZE;
REINDEX DATABASE superstock;
```

### API Performance

```csharp
// Enable response caching
[ResponseCache(Duration = 60, VaryByQueryKeys = new[] { "category" })]
public async Task<IActionResult> GetProducts([FromQuery] string? category)

// Use async/await properly
public async Task<List<Product>> GetProductsAsync()
{
    return await _context.Products
        .AsNoTracking()  // Read-only queries
        .ToListAsync();
}

// Batch database operations
public async Task UpdateBatchesAsync(List<Batch> batches)
{
    await _context.BulkUpdateAsync(batches);  // EFCore.BulkExtensions
}
```

### Connection Pool Settings

```json
// appsettings.Production.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db;Database=superstock;Username=app;Password=xxx;Pooling=true;Minimum Pool Size=5;Maximum Pool Size=100;Connection Idle Lifetime=300"
  }
}
```

---

## 10.6 Security Operations

### Regular Security Tasks

| Task | Frequency | Owner |
|------|-----------|-------|
| Update dependencies | Weekly | Dev Team |
| Review access logs | Daily | Security |
| Rotate secrets | Quarterly | DevOps |
| Penetration testing | Annually | External |
| Security audit | Semi-annually | Security |

### Dependency Updates

```bash
# Backend - Check for vulnerabilities
dotnet list package --vulnerable

# Frontend - Audit
npm audit
npm audit fix

# Update all packages
dotnet outdated --upgrade
npm update
```

### Secret Rotation

```bash
# Rotate JWT secret
# 1. Generate new secret
openssl rand -base64 32

# 2. Update in secret manager/env
# 3. Deploy with new secret
# 4. Old tokens will expire naturally (24h)
```

---

## 10.7 Troubleshooting Guide

### Common Issues

#### API Returns 500 Error

```bash
# Check logs
docker logs superstock-api --tail 100

# Check database connection
docker exec superstock-api dotnet ef database update --dry-run

# Check health
curl http://localhost:5000/health
```

#### Database Connection Failures

```bash
# Check PostgreSQL status
docker exec superstock-db pg_isready

# Check connections
docker exec superstock-db psql -U superstock -c "SELECT count(*) FROM pg_stat_activity;"

# Restart database
docker-compose restart postgres
```

#### Redis Connection Issues

```bash
# Check Redis status
docker exec superstock-cache redis-cli ping

# Check memory usage
docker exec superstock-cache redis-cli info memory

# Check connected clients
docker exec superstock-cache redis-cli info clients

# View cache keys (development only)
docker exec superstock-cache redis-cli keys "*"

# Clear all cache (use with caution)
docker exec superstock-cache redis-cli FLUSHALL

# Restart Redis
docker-compose restart redis
```

#### High Memory Usage

```bash
# Check container stats
docker stats superstock-api

# Force garbage collection (temporary)
curl -X POST http://localhost:5000/admin/gc

# Check for memory leaks
dotnet-counters monitor --process-id <pid>
```

#### Slow API Responses

```bash
# Check database query times
docker exec superstock-db psql -U superstock -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 5;"

# Check API metrics
curl http://localhost:5000/metrics

# Enable detailed logging temporarily
export Serilog__MinimumLevel__Default=Debug
```

### Emergency Procedures

#### Rollback Deployment

```bash
# Revert to previous image
docker-compose stop api
docker tag superstock-api:latest superstock-api:failed
docker pull superstock-api:previous
docker tag superstock-api:previous superstock-api:latest
docker-compose up -d api
```

#### Database Emergency Access

```bash
# Direct database access
docker exec -it superstock-db psql -U superstock

# Read-only mode (for maintenance)
ALTER DATABASE superstock SET default_transaction_read_only = on;
```

---

## 10.8 Maintenance Windows

### Scheduled Maintenance

| Day | Time (UTC) | Type |
|-----|------------|------|
| Sunday | 02:00 - 04:00 | Database maintenance |
| 1st of month | 03:00 - 05:00 | Security updates |
| Quarterly | 02:00 - 06:00 | Major upgrades |

### Maintenance Notification Template

```
Subject: SuperStock Scheduled Maintenance - [DATE]

Dear Users,

We will be performing scheduled maintenance on SuperStock:

Date: [DATE]
Time: [START] - [END] UTC
Impact: [DESCRIPTION]

During this time, the system may be unavailable or experience slower performance.

We apologize for any inconvenience.

Best regards,
SuperStock Operations Team
```

---

## 10.9 Runbook Quick Reference

| Situation | Command |
|-----------|---------|
| Restart API | `docker-compose restart api` |
| View API logs | `docker logs -f superstock-api` |
| Check health | `curl localhost:5000/health` |
| Database backup | `./scripts/backup.sh` |
| Clear Redis cache | `docker exec superstock-cache redis-cli FLUSHALL` |
| Check Redis memory | `docker exec superstock-cache redis-cli info memory` |
| Restart Redis | `docker-compose restart redis` |
| Force job run | Hangfire Dashboard → Jobs → Trigger |

---

[Next: Appendix →](./11-appendix.md)
