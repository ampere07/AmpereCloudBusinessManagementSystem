# Billing Generation - Quick Reference

## Commands

```bash
# Generate billings for today
php artisan billing:generate-daily

# Generate for specific day
php artisan billing:generate-daily --day=15

# Generate for specific date
php artisan billing:generate-daily --date=2025-10-15

# Test scheduler
php artisan schedule:run

# List all commands
php artisan list
```

## API Endpoints

```
POST /api/billing-generation/generate-today
POST /api/billing-generation/generate-for-day
POST /api/billing-generation/generate-enhanced-invoices
POST /api/billing-generation/generate-enhanced-statements
GET  /api/billing-generation/invoices
GET  /api/billing-generation/statements
GET  /api/billing/accounts/active
GET  /api/billing/accounts/by-day/{day}
```

## Key Files

```
Services:
  app/Services/EnhancedBillingGenerationService.php
  app/Services/BillingGenerationService.php (legacy)

Controllers:
  app/Http/Controllers/BillingGenerationController.php

Commands:
  app/Console/Commands/GenerateDailyBillings.php

Configuration:
  app/Console/Kernel.php (scheduler config)

Routes:
  routes/api.php

Documentation:
  BILLING_GENERATION_README.md
  BILLING_SETUP_GUIDE.md
```

## Database Tables

```sql
-- Primary
billing_accounts
customers
plan_list (or app_plans)
invoices
statement_of_accounts

-- Supporting
discounts
installments
service_charge_logs
```

## Constants

```php
VAT_RATE = 0.12 (12%)
DAYS_IN_MONTH = 30
DAYS_UNTIL_DUE = 7
DAYS_UNTIL_DC_NOTICE = 4
```

## Status Values

```
Billing Status: 2 = Active
Invoice Status: Unpaid, Paid, Partial
Discount Status: Unused, Used, Permanent, Monthly
Installment Status: active, completed, cancelled
```

## Common Queries

```sql
-- Active accounts for today
SELECT * FROM billing_accounts 
WHERE billing_day = DAY(CURDATE()) 
  AND billing_status_id = 2 
  AND date_installed IS NOT NULL;

-- Recent invoices
SELECT * FROM invoices 
ORDER BY created_at DESC 
LIMIT 10;

-- Recent statements
SELECT * FROM statement_of_accounts 
ORDER BY created_at DESC 
LIMIT 10;

-- Accounts with balance
SELECT account_no, account_balance 
FROM billing_accounts 
WHERE account_balance > 0;
```

## Error Handling

```php
// All operations use transactions
DB::beginTransaction();
try {
    // ... operations
    DB::commit();
} catch (\Exception $e) {
    DB::rollBack();
    Log::error($e->getMessage());
}
```

## Logging

```bash
# View logs
tail -f storage/logs/laravel.log

# Search billing logs
grep "billing generation" storage/logs/laravel.log

# Today's logs
grep "$(date +%Y-%m-%d)" storage/logs/laravel.log
```

## Testing Checklist

- [ ] Active billing accounts exist
- [ ] Accounts have billing_day set
- [ ] Accounts have date_installed
- [ ] Customers have desired_plan
- [ ] Plans exist with prices
- [ ] Billing status is Active (2)
- [ ] Database migrations complete
- [ ] Service files in place
- [ ] Routes registered
- [ ] Scheduler configured

## Troubleshooting

```bash
# Check service exists
php artisan tinker
>>> app()->make('App\Services\EnhancedBillingGenerationService');

# Regenerate autoloader
composer dump-autoload

# Clear cache
php artisan cache:clear
php artisan config:clear

# Check database connection
php artisan tinker
>>> DB::connection()->getPdo();
```

## Production Notes

1. Set up cron: `* * * * * php artisan schedule:run`
2. Monitor logs regularly
3. Set up error notifications
4. Test with small batch first
5. Monitor system resources
6. Enable log rotation
7. Configure backup schedule

## Support Commands

```bash
# Check configuration
php artisan config:show

# Test database
php artisan migrate:status

# Clear all caches
php artisan optimize:clear

# View routes
php artisan route:list | grep billing
```
