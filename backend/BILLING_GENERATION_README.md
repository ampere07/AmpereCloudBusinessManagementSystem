# Enhanced Billing Generation System

This system replicates the functionality of the Google Apps Script billing generation with improved architecture and Laravel best practices.

## Features

### Statement of Account (SOA) Generation
- Automatically generates SOA for accounts with matching billing days
- Calculates proration based on installation date
- Handles VAT calculations (12%)
- Processes staggered fees and installments
- Applies discounts (one-time, permanent, and monthly)
- Applies advanced payments and rebates
- Includes service charges
- Adjusts billing dates for February (29/30/31 -> 1/2/3)

### Invoice Generation
- Generates invoices for active accounts
- Calculates total amounts including all charges and deductions
- Updates account balances automatically
- Marks invoices as Paid or Unpaid based on total amount
- Processes installment schedules
- Applies discounts and marks them as used

## API Endpoints

### Generate Today's Billings
```http
POST /api/billing-generation/generate-today
```
Generates both SOA and invoices for all accounts with billing day matching today's date.

### Generate Enhanced Invoices
```http
POST /api/billing-generation/generate-enhanced-invoices
Content-Type: application/json

{
  "billing_day": 15,
  "generation_date": "2025-10-15" // optional
}
```

### Generate Enhanced Statements
```http
POST /api/billing-generation/generate-enhanced-statements
Content-Type: application/json

{
  "billing_day": 15,
  "generation_date": "2025-10-15" // optional
}
```

### Generate for Specific Billing Day
```http
POST /api/billing-generation/generate-for-day
Content-Type: application/json

{
  "billing_day": 15
}
```

### Get Invoices
```http
GET /api/billing-generation/invoices?account_id=123&status=Unpaid
```

### Get Statements
```http
GET /api/billing-generation/statements?account_id=123
```

### Get Active Accounts
```http
GET /api/billing/accounts/active
```

### Get Accounts by Billing Day
```http
GET /api/billing/accounts/by-day/15
```

## Command Line Interface

### Generate Daily Billings
```bash
php artisan billing:generate-daily
```

### Generate for Specific Day
```bash
php artisan billing:generate-daily --day=15
```

### Generate for Specific Date
```bash
php artisan billing:generate-daily --date=2025-10-15
```

### Generate with Custom User ID
```bash
php artisan billing:generate-daily --user-id=5
```

## Scheduled Execution

Add to `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    // Generate billings daily at 1:00 AM
    $schedule->command('billing:generate-daily')
             ->dailyAt('01:00')
             ->withoutOverlapping()
             ->runInBackground();
    
    // Or run every hour during business hours
    $schedule->command('billing:generate-daily')
             ->hourly()
             ->between('1:00', '23:00')
             ->withoutOverlapping();
}
```

## Calculation Logic

### Proration Calculation
- For new accounts (no previous balance update):
  - Days = (Current Date + 7 days buffer) - Installation Date
  - Daily Rate = Monthly Fee / 30
  - Prorated Amount = Daily Rate × Days
  
- For existing accounts:
  - Full monthly fee is charged

### VAT Calculation
```
Gross Amount = Prorated Amount / 1.12
VAT = Gross Amount × 0.12
Net Monthly Service Fee = Prorated Amount - VAT
```

### Total Calculation
```
Others and Basic Charges = 
  + Staggered Fees
  + Staggered Installation Fees
  + Service Fees
  - Discounts
  - Advanced Payments
  - Rebates

Amount Due = Monthly Service Fee + VAT + Others and Basic Charges
Total Amount Due = Account Balance + Amount Due
```

## Database Tables Used

- `billing_accounts` - Main billing account data
- `customers` - Customer information
- `plan_list` (app_plans) - Plan pricing
- `invoices` - Generated invoices
- `statement_of_accounts` - Generated SOAs
- `discounts` - Discount records
- `installments` - Installment schedules
- `service_charge_logs` - Service fees

## Status Values

### Invoice Status
- `Unpaid` - Default for positive amounts
- `Paid` - For zero or negative amounts
- `Partial` - When partial payment received

### Discount Status
- `Unused` - Not yet applied
- `Used` - Applied once
- `Permanent` - Applied every billing cycle
- `Monthly` - Applied for specified number of months

### Installment Status
- `active` - Currently being paid
- `completed` - All payments made
- `cancelled` - Installment cancelled

## Error Handling

The system includes comprehensive error handling:
- Transaction rollback on failure
- Detailed error logging
- Account-level error tracking
- Continues processing other accounts if one fails

## Logging

All billing generation activities are logged:
```
storage/logs/laravel.log
```

Log entries include:
- Timestamp
- Billing day
- Success/failure counts
- Error details
- Execution time

## Testing

### Test Endpoints
```bash
# Check active accounts count
curl http://localhost:8000/api/billing/accounts/active

# Check accounts for specific day
curl http://localhost:8000/api/billing/accounts/by-day/15

# Generate test billing
curl -X POST http://localhost:8000/api/billing-generation/generate-for-day \
  -H "Content-Type: application/json" \
  -d '{"billing_day": 15}'
```

### Manual Testing
1. Create test billing account with `billing_status_id = 2` (Active)
2. Set `date_installed` to a past date
3. Set `billing_day` to desired day
4. Run generation command
5. Check `invoices` and `statement_of_accounts` tables

## Migration from Google Apps Script

Key differences from the original script:

1. **Triggers**: Laravel scheduling instead of time-based triggers
2. **Cache**: Database transactions instead of cache service
3. **PDF Generation**: Placeholder for future implementation
4. **Folder Structure**: Digital assets instead of Google Drive
5. **Date Handling**: Carbon instead of Google Utilities
6. **Error Recovery**: Transaction rollback with detailed logging

## Future Enhancements

- PDF generation for SOA and invoices
- Email delivery of billing documents
- SMS notification integration
- Batch processing with queue workers
- Real-time progress tracking
- Advanced payment scheduling
- Rebate management interface
- Mass discount application

## Support

For issues or questions:
- Check logs: `storage/logs/laravel.log`
- Review generated records in database
- Verify account status and billing day
- Ensure plan prices are configured
