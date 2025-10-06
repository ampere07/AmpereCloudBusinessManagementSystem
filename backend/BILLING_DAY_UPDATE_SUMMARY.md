# Billing Day Update Summary

## What Changed

The billing generation system now supports two ways of setting the billing day:

### 1. End-of-Month Billing (`billing_day = 0`)
- **Database Value**: `0`
- **Checkbox**: "Automatic End-of-Month Billing"
- **Behavior**: Bills generate on the last day of each month (Jan 31, Feb 28/29, Apr 30, etc.)

### 2. Specific Day Billing (`billing_day = 1-31`)
- **Database Value**: `1` to `31`
- **Input**: Manual date selection
- **Behavior**: Bills generate when current day matches billing_day

## Key Features

### Automatic Processing
The scheduled task (`dailyAt('01:00')`) automatically detects:
- If today is the last day of the month → Process `billing_day = 0` accounts
- Always process accounts where `billing_day = current_day`

### February Adjustment
For accounts with `billing_day = 29/30/31` in February:
- Day 29 → Processes on March 1
- Day 30 → Processes on March 2  
- Day 31 → Processes on March 3

## Quick Commands

```bash
# Generate today's billings (auto-detects end-of-month and current day)
php artisan billing:generate-daily

# Generate ONLY end-of-month accounts
php artisan billing:generate-daily --day=0

# Generate ONLY day 15 accounts
php artisan billing:generate-daily --day=15

# Test on specific date
php artisan billing:generate-daily --date=2025-10-31
```

## API Usage

```javascript
// Generate today's billings
POST /api/billing-generation/generate-today

// Generate specific billing day
POST /api/billing-generation/generate-for-day
{
    "billing_day": 0  // or 1-31
}
```

## Database Schema

```sql
-- billing_accounts table
billing_day TINYINT DEFAULT 0  -- 0 = end-of-month, 1-31 = specific day
```

## Frontend Implementation

```html
<!-- Checkbox for end-of-month -->
<input type="checkbox" id="endOfMonth" onchange="toggleBillingDay()">
<label>Automatic End-of-Month Billing</label>

<!-- Number input for specific day -->
<input type="number" id="billingDay" min="1" max="31" value="15">

<script>
function toggleBillingDay() {
    const checkbox = document.getElementById('endOfMonth');
    const input = document.getElementById('billingDay');
    
    if (checkbox.checked) {
        input.value = 0;
        input.disabled = true;
    } else {
        input.value = 15;
        input.disabled = false;
    }
}
</script>
```

## Testing Examples

### Example 1: October 31 (Last Day)
```
Current Day: 31
Is Last Day: Yes

Processes:
✓ billing_day = 0 (end-of-month)
✓ billing_day = 31 (specific day)
```

### Example 2: October 15 (Mid-Month)
```
Current Day: 15
Is Last Day: No

Processes:
✗ billing_day = 0 (NOT last day)
✓ billing_day = 15 (matches current day)
```

### Example 3: February 28 (Non-Leap Year)
```
Current Day: 28
Is Last Day: Yes

Processes:
✓ billing_day = 0 (end-of-month)
✓ billing_day = 28 (specific day)
✓ billing_day = 29 (adjusted to March 1)
✓ billing_day = 30 (adjusted to March 2)
✓ billing_day = 31 (adjusted to March 3)
```

## Files Modified

1. **EnhancedBillingGenerationService.php**
   - Added `END_OF_MONTH_BILLING = 0` constant
   - Updated `getActiveAccountsForBillingDay()` to handle billing_day = 0
   - Updated `calculateAdjustedBillingDate()` for end-of-month logic
   - Updated `generateAllBillingsForToday()` to process both types
   - Updated `calculateRebates()` to match end-of-month correctly

2. **GenerateDailyBillings.php**
   - Updated command description to mention `--day=0`
   - Added `generateForToday()` method for automatic detection
   - Added `generateForSpecificBillingDay()` for manual generation
   - Enhanced output to show which billing days were processed

3. **BILLING_DAY_CONFIGURATION.md** (New)
   - Comprehensive guide for the new system
   - Frontend integration examples
   - Testing scenarios
   - Troubleshooting guide

## Validation

```php
// Controller validation
$validated = $request->validate([
    'billing_day' => 'required|integer|min:0|max:31'
]);

// Database constraint
CHECK (billing_day >= 0 AND billing_day <= 31)
```

## Migration Script

```php
// Update existing accounts if needed
DB::table('billing_accounts')
    ->whereNull('billing_day')
    ->update(['billing_day' => 0]);
```

## Next Steps

1. **Test the system:**
   ```bash
   php artisan billing:generate-daily --day=0
   ```

2. **Update frontend forms** to include the checkbox option

3. **Verify database** has `billing_day` column with correct type

4. **Update validation rules** in controllers to accept 0-31

5. **Monitor logs** during first month:
   ```bash
   tail -f storage/logs/laravel.log | grep "billing generation"
   ```

## Important Notes

- The system now processes BOTH end-of-month and specific day accounts when today is the last day of the month
- `billing_day = 0` is reserved for end-of-month billing
- Values 1-31 represent specific days
- February accounts with day 29/30/31 automatically adjust to early March
- The scheduler runs once daily and handles all detection automatically
