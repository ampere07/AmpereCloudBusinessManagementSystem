# Billing Day Configuration Guide

## Overview

The billing system now supports two types of billing day configuration:

1. **Automatic End-of-Month Billing** (`billing_day = 0`)
2. **Specific Day Billing** (`billing_day = 1-31`)

## Billing Day Values

### `billing_day = 0` (End-of-Month)
- **Usage**: For customers who want automatic end-of-month billing
- **Trigger**: Generates bills on the last day of each month
- **Examples**:
  - January: Generates on January 31
  - February: Generates on February 28 (or 29 in leap years)
  - April: Generates on April 30

### `billing_day = 1-31` (Specific Day)
- **Usage**: For customers who want billing on a specific day
- **Trigger**: Generates bills when current day matches `billing_day`
- **Examples**:
  - `billing_day = 5`: Generates on the 5th of each month
  - `billing_day = 15`: Generates on the 15th of each month
  - `billing_day = 25`: Generates on the 25th of each month

## Database Schema

### `billing_accounts` Table

```sql
CREATE TABLE billing_accounts (
    id BIGINT PRIMARY KEY,
    account_no VARCHAR(255),
    customer_id BIGINT,
    billing_day TINYINT DEFAULT 0,  -- 0 = end-of-month, 1-31 = specific day
    billing_status_id INT,
    date_installed DATE,
    account_balance DECIMAL(10,2),
    balance_update_date DATE,
    -- other columns...
);
```

## Generation Logic

### Daily Scheduled Generation

The system runs daily at 1:00 AM and processes:

1. **If it is the last day of the month**:
   - Generate for all accounts with `billing_day = 0`
   - Generate for accounts where `billing_day = current_day`

2. **If it is NOT the last day of the month**:
   - Generate only for accounts where `billing_day = current_day`

### Example Scenarios

#### Scenario 1: October 31 (Last Day of Month)
```
Accounts processed:
- billing_day = 0 (end-of-month accounts) ✓
- billing_day = 31 (specific day accounts) ✓
```

#### Scenario 2: October 15 (Mid-Month)
```
Accounts processed:
- billing_day = 15 (specific day accounts) ✓
- billing_day = 0 (NOT processed) ✗
```

#### Scenario 3: February 28 (Last Day, Non-Leap Year)
```
Accounts processed:
- billing_day = 0 (end-of-month accounts) ✓
- billing_day = 28 (specific day accounts) ✓
- billing_day = 29 → adjusted to March 1 ✓
- billing_day = 30 → adjusted to March 2 ✓
- billing_day = 31 → adjusted to March 3 ✓
```

## Command Line Usage

### Generate Today's Billings
```bash
# Processes both end-of-month (if applicable) and current day accounts
php artisan billing:generate-daily
```

### Generate for End-of-Month Accounts Only
```bash
php artisan billing:generate-daily --day=0
```

### Generate for Specific Day
```bash
php artisan billing:generate-daily --day=15
```

### Generate with Custom Date
```bash
php artisan billing:generate-daily --date=2025-10-31
```

### Generate for Specific Day on Custom Date
```bash
php artisan billing:generate-daily --day=0 --date=2025-10-31
```

## API Endpoints

### Generate Today's Billings
```http
POST /api/billing-generation/generate-today
Authorization: Bearer {token}
```

**Response:**
```json
{
    "success": true,
    "message": "Generated 45 billing records successfully",
    "data": {
        "date": "2025-10-31",
        "billing_days_processed": [
            "End of Month (0)",
            "Day 31"
        ],
        "invoices": {
            "success": 25,
            "failed": 0,
            "errors": []
        },
        "statements": {
            "success": 20,
            "failed": 0,
            "errors": []
        }
    }
}
```

### Generate for Specific Billing Day
```http
POST /api/billing-generation/generate-for-day
Authorization: Bearer {token}
Content-Type: application/json

{
    "billing_day": 0
}
```

### Generate Enhanced Invoices
```http
POST /api/billing-generation/generate-enhanced-invoices
Authorization: Bearer {token}
Content-Type: application/json

{
    "billing_day": 0,
    "generation_date": "2025-10-31"
}
```

## Frontend Integration

### Customer Form - Billing Day Selection

```html
<form>
    <div class="form-group">
        <label>
            <input type="checkbox" name="end_of_month_billing" id="endOfMonthCheck">
            Automatic End-of-Month Billing
        </label>
    </div>
    
    <div class="form-group" id="specificDayGroup">
        <label for="billing_day">Billing Day (1-31)</label>
        <input 
            type="number" 
            name="billing_day" 
            id="billingDay"
            min="1" 
            max="31"
            value="15"
        >
    </div>
</form>

<script>
document.getElementById('endOfMonthCheck').addEventListener('change', function() {
    const specificDayGroup = document.getElementById('specificDayGroup');
    const billingDayInput = document.getElementById('billingDay');
    
    if (this.checked) {
        specificDayGroup.style.display = 'none';
        billingDayInput.value = 0;
        billingDayInput.disabled = true;
    } else {
        specificDayGroup.style.display = 'block';
        billingDayInput.value = 15;
        billingDayInput.disabled = false;
    }
});
</script>
```

### JavaScript - Save Customer
```javascript
async function saveCustomer(formData) {
    const endOfMonthChecked = document.getElementById('endOfMonthCheck').checked;
    const billingDay = endOfMonthChecked ? 0 : parseInt(document.getElementById('billingDay').value);
    
    const data = {
        ...formData,
        billing_day: billingDay
    };
    
    const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    
    return response.json();
}
```

## Testing

### Test End-of-Month Billing
```bash
# Set test date to last day of month
php artisan billing:generate-daily --date=2025-10-31 --day=0

# Verify accounts with billing_day = 0 were processed
mysql> SELECT * FROM invoices WHERE DATE(invoice_date) = '2025-10-31';
```

### Test Specific Day Billing
```bash
# Generate for day 15
php artisan billing:generate-daily --day=15

# Verify accounts with billing_day = 15 were processed
mysql> SELECT * FROM invoices WHERE DATE(invoice_date) = CURDATE();
```

### Test February Adjustment
```bash
# Test on February 28
php artisan billing:generate-daily --date=2025-02-28

# Should process:
# - billing_day = 0 (end of month)
# - billing_day = 28
# - billing_day = 29 (adjusted to day 1)
# - billing_day = 30 (adjusted to day 2)
# - billing_day = 31 (adjusted to day 3)
```

## Validation Rules

### Controller Validation
```php
$validated = $request->validate([
    'billing_day' => 'required|integer|min:0|max:31'
]);
```

### Database Constraints
```sql
ALTER TABLE billing_accounts 
ADD CONSTRAINT check_billing_day 
CHECK (billing_day >= 0 AND billing_day <= 31);
```

## Migration

### Update Existing Accounts

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateBillingDayColumn extends Migration
{
    public function up()
    {
        // Update existing accounts if needed
        DB::table('billing_accounts')
            ->whereNull('billing_day')
            ->update(['billing_day' => 0]);
            
        // Add constraint
        Schema::table('billing_accounts', function (Blueprint $table) {
            $table->tinyInteger('billing_day')->default(0)->change();
        });
    }

    public function down()
    {
        Schema::table('billing_accounts', function (Blueprint $table) {
            $table->tinyInteger('billing_day')->nullable()->change();
        });
    }
}
```

## Monitoring

### Check Today's Billing Accounts
```sql
-- For end-of-month (when today is last day of month)
SELECT * FROM billing_accounts 
WHERE billing_day = 0 
  AND billing_status_id = 2 
  AND date_installed IS NOT NULL;

-- For specific day
SELECT * FROM billing_accounts 
WHERE billing_day = DAY(CURDATE()) 
  AND billing_status_id = 2 
  AND date_installed IS NOT NULL;
```

### Verify Generated Records
```sql
-- Check today's invoices
SELECT 
    ba.account_no,
    ba.billing_day,
    i.invoice_date,
    i.total_amount,
    i.status
FROM invoices i
JOIN billing_accounts ba ON ba.id = i.account_id
WHERE DATE(i.invoice_date) = CURDATE()
ORDER BY ba.billing_day;
```

## Troubleshooting

### Issue: End-of-Month Accounts Not Processing

**Check:**
```bash
php artisan tinker
>>> Carbon\Carbon::now()->isLastOfMonth()
=> true  # Should be true on last day of month
```

**Solution:**
```bash
# Force generation for billing_day = 0
php artisan billing:generate-daily --day=0
```

### Issue: Specific Day Not Processing

**Check:**
```sql
SELECT account_no, billing_day, billing_status_id, date_installed
FROM billing_accounts
WHERE billing_day = 15 
  AND billing_status_id = 2;
```

**Solution:**
```bash
# Force generation for specific day
php artisan billing:generate-daily --day=15
```

### Issue: February Adjustment Not Working

**Check:**
```bash
php artisan tinker
>>> $date = Carbon\Carbon::parse('2025-02-28');
>>> $date->format('M')
=> "Feb"
```

**Solution:** Verify adjustment logic in `adjustBillingDayForMonth()` method.

## Best Practices

1. **Default to End-of-Month for Corporate Accounts**
   - Easier for accounting departments
   - Consistent billing cycles

2. **Use Specific Days for Individual Customers**
   - Allows flexibility for salary dates
   - Better cash flow management

3. **Monitor Generation Logs Daily**
   ```bash
   tail -f storage/logs/laravel.log | grep "billing generation"
   ```

4. **Set Up Alert for Failed Generations**
   - Email notifications for failed > 5%
   - Slack integration for real-time alerts

5. **Backup Before Mass Changes**
   ```bash
   mysqldump -u user -p database > backup_before_billing_$(date +%Y%m%d).sql
   ```
