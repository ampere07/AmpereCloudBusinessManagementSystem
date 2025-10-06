# Billing Generation System - Setup Guide

## Prerequisites

- Laravel application installed and configured
- Database connection established
- Required tables migrated (billing_accounts, invoices, statement_of_accounts, etc.)
- Active billing accounts with customers and plans configured

## Installation Steps

### 1. Verify Service Files

Ensure these files are in place:
```
backend/app/Services/EnhancedBillingGenerationService.php
backend/app/Console/Commands/GenerateDailyBillings.php
backend/app/Http/Controllers/BillingGenerationController.php (updated)
```

### 2. Register Service Provider (Optional)

If not using auto-discovery, add to `config/app.php`:
```php
'providers' => [
    // ...
    App\Providers\BillingServiceProvider::class,
],
```

### 3. Configure Scheduler

The scheduler is already configured in `app/Console/Kernel.php`.

To run the scheduler, add to your cron:
```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

### 4. Test Command Manually

```bash
# Generate billings for today
php artisan billing:generate-daily

# Generate for specific day
php artisan billing:generate-daily --day=15

# Generate for specific date
php artisan billing:generate-daily --date=2025-10-15
```

### 5. Verify Database Tables

Ensure these tables exist and have proper structure:
- `billing_accounts` (with billing_status_id, billing_day, date_installed)
- `customers` (with desired_plan)
- `plan_list` or `app_plans` (with Plan_Name, Plan_Price)
- `invoices`
- `statement_of_accounts`
- `discounts`
- `installments`
- `service_charge_logs`

## Testing

### Test Data Setup

1. Create a test billing account:
```sql
INSERT INTO billing_accounts (
    customer_id, 
    account_no, 
    date_installed, 
    plan_id, 
    account_balance, 
    billing_day, 
    billing_status_id,
    created_at
) VALUES (
    1,  -- existing customer_id
    'TEST-001',
    '2025-09-01',
    1,  -- existing plan_id
    0.00,
    15,  -- billing day
    2,  -- Active status
    NOW()
);
```

2. Ensure customer has desired_plan:
```sql
UPDATE customers 
SET desired_plan = 'Plan 1599' 
WHERE id = 1;
```

3. Ensure plan exists:
```sql
SELECT * FROM plan_list WHERE plan_name = 'Plan 1599';
-- OR
SELECT * FROM app_plans WHERE Plan_Name = 'Plan 1599';
```

### API Testing

#### Using cURL:

```bash
# Generate billings for today
curl -X POST http://localhost:8000/api/billing-generation/generate-today \
  -H "Content-Type: application/json"

# Generate for specific day
curl -X POST http://localhost:8000/api/billing-generation/generate-for-day \
  -H "Content-Type: application/json" \
  -d '{"billing_day": 15}'

# Get generated invoices
curl http://localhost:8000/api/billing-generation/invoices

# Get generated statements
curl http://localhost:8000/api/billing-generation/statements
```

#### Using Postman:

1. Import the following collection:

```json
{
  "info": {
    "name": "Billing Generation API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Generate Today's Billings",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "http://localhost:8000/api/billing-generation/generate-today",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["api", "billing-generation", "generate-today"]
        }
      }
    },
    {
      "name": "Generate for Specific Day",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"billing_day\": 15\n}"
        },
        "url": {
          "raw": "http://localhost:8000/api/billing-generation/generate-for-day",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["api", "billing-generation", "generate-for-day"]
        }
      }
    },
    {
      "name": "Get Active Accounts",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:8000/api/billing/accounts/active",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["api", "billing", "accounts", "active"]
        }
      }
    },
    {
      "name": "Get Accounts by Day",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:8000/api/billing/accounts/by-day/15",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["api", "billing", "accounts", "by-day", "15"]
        }
      }
    },
    {
      "name": "Get Invoices",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:8000/api/billing-generation/invoices",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["api", "billing-generation", "invoices"]
        }
      }
    },
    {
      "name": "Get Statements",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:8000/api/billing-generation/statements",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["api", "billing-generation", "statements"]
        }
      }
    }
  ]
}
```

### Verify Results

After generation, check the database:

```sql
-- Check generated invoices
SELECT 
    i.id,
    i.account_id,
    ba.account_no,
    c.first_name,
    c.last_name,
    i.invoice_date,
    i.total_amount,
    i.status,
    i.due_date
FROM invoices i
JOIN billing_accounts ba ON i.account_id = ba.id
JOIN customers c ON ba.customer_id = c.id
ORDER BY i.created_at DESC
LIMIT 10;

-- Check generated statements
SELECT 
    soa.id,
    soa.account_id,
    ba.account_no,
    c.first_name,
    c.last_name,
    soa.statement_date,
    soa.total_amount_due,
    soa.due_date
FROM statement_of_accounts soa
JOIN billing_accounts ba ON soa.account_id = ba.id
JOIN customers c ON ba.customer_id = c.id
ORDER BY soa.created_at DESC
LIMIT 10;

-- Check updated account balances
SELECT 
    account_no,
    account_balance,
    balance_update_date
FROM billing_accounts
WHERE balance_update_date IS NOT NULL
ORDER BY balance_update_date DESC
LIMIT 10;
```

## Troubleshooting

### No Billings Generated

Check:
1. Are there accounts with matching billing_day?
   ```sql
   SELECT COUNT(*) FROM billing_accounts 
   WHERE billing_day = DAY(CURDATE()) 
   AND billing_status_id = 2;
   ```

2. Are accounts active?
   ```sql
   SELECT * FROM billing_accounts 
   WHERE billing_status_id != 2;
   ```

3. Is date_installed set?
   ```sql
   SELECT * FROM billing_accounts 
   WHERE date_installed IS NULL;
   ```

### Calculation Errors

Check:
1. Plan prices are set:
   ```sql
   SELECT * FROM plan_list WHERE price IS NULL;
   -- OR
   SELECT * FROM app_plans WHERE Plan_Price IS NULL;
   ```

2. Customer has desired_plan:
   ```sql
   SELECT c.id, c.first_name, c.desired_plan, ba.account_no
   FROM customers c
   JOIN billing_accounts ba ON c.id = ba.customer_id
   WHERE c.desired_plan IS NULL;
   ```

### Service Not Found Error

If you get "Service not found", ensure:
1. Service file is in correct location
2. Namespace is correct
3. Run `composer dump-autoload`

### Scheduler Not Running

If scheduled jobs do not run:
1. Check cron is configured
2. Test manually: `php artisan schedule:run`
3. Check logs: `tail -f storage/logs/laravel.log`

## Monitoring

### Check Logs

```bash
# Real-time log monitoring
tail -f storage/logs/laravel.log

# Filter billing logs
grep "billing generation" storage/logs/laravel.log

# Check today's generation
grep "$(date +%Y-%m-%d)" storage/logs/laravel.log | grep billing
```

### Performance Metrics

Monitor execution time:
```sql
-- Average generation time from logs
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_generated,
    AVG(TIMESTAMPDIFF(SECOND, created_at, updated_at)) as avg_seconds
FROM invoices
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Production Deployment

1. Set up proper cron schedule
2. Configure error notifications
3. Set up monitoring alerts
4. Enable log rotation
5. Test with small batch first
6. Monitor system resources during generation

## Support

For issues:
1. Check logs: `storage/logs/laravel.log`
2. Review database records
3. Test API endpoints manually
4. Run command with verbose output: `php artisan billing:generate-daily -vvv`
