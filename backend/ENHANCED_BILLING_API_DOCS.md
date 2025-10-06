# Enhanced Billing Features - API Documentation

## Overview

This document covers the newly implemented billing features that replicate the Google Apps Script functionality:

1. **Installment Tracking** - Track payment schedules with invoice IDs
2. **Advanced Payments** - Pre-paid amounts for specific months
3. **Mass Rebates** - Group discounts for barangays/billing days
4. **Invoice ID Generation** - YYMMDDHHXXXX format
5. **Payment Received Tracking** - Track previous month payments

---

## New Database Tables

### advanced_payments
Stores pre-paid amounts for specific billing months.

```sql
CREATE TABLE advanced_payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_id BIGINT,
    account_no VARCHAR(255),
    payment_amount DECIMAL(10,2),
    payment_month VARCHAR(50),
    payment_date DATE,
    status VARCHAR(50) DEFAULT 'Unused',
    invoice_used_id BIGINT,
    remarks TEXT,
    created_at TIMESTAMP,
    created_by_user_id BIGINT,
    updated_at TIMESTAMP,
    updated_by_user_id BIGINT
);
```

### mass_rebates
Mass discount applications for specific barangays and billing days.

```sql
CREATE TABLE mass_rebates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rebate_days INTEGER,
    billing_day INTEGER,
    status VARCHAR(50) DEFAULT 'Unused',
    rebate_date DATE,
    barangay_code VARCHAR(50),
    description TEXT,
    remarks TEXT,
    created_at TIMESTAMP,
    created_by_user_id BIGINT,
    updated_at TIMESTAMP,
    updated_by_user_id BIGINT
);
```

### installment_schedules
Individual payment schedules for installments, tracked per invoice.

```sql
CREATE TABLE installment_schedules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    installment_id BIGINT,
    invoice_id BIGINT,
    installment_no INTEGER,
    due_date DATE,
    amount DECIMAL(10,2),
    status ENUM('pending', 'paid', 'overdue'),
    created_by BIGINT,
    created_at TIMESTAMP,
    updated_by BIGINT,
    updated_at TIMESTAMP
);
```

---

## API Endpoints

### Advanced Payments

#### List Advanced Payments
```http
GET /api/advanced-payments
Query Parameters:
  - account_id (optional)
  - status (optional): Unused, Used
  - payment_month (optional)

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "account_id": 123,
      "payment_amount": 1599.00,
      "payment_month": "October",
      "payment_date": "2025-09-15",
      "status": "Unused",
      "created_at": "2025-09-15"
    }
  ],
  "count": 1
}
```

#### Create Advanced Payment
```http
POST /api/advanced-payments
Content-Type: application/json

{
  "account_id": 123,
  "payment_amount": 1599.00,
  "payment_month": "November",
  "payment_date": "2025-10-15",
  "remarks": "Pre-payment for November"
}

Response:
{
  "success": true,
  "message": "Advanced payment created successfully",
  "data": { ... }
}
```

#### Update Advanced Payment
```http
PUT /api/advanced-payments/{id}
Content-Type: application/json

{
  "payment_amount": 1799.00,
  "remarks": "Updated amount"
}
```

#### Delete Advanced Payment
```http
DELETE /api/advanced-payments/{id}
```

---

### Mass Rebates

#### List Mass Rebates
```http
GET /api/mass-rebates
Query Parameters:
  - status (optional): Unused, Used
  - billing_day (optional)
  - barangay_code (optional)

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "rebate_days": 3,
      "billing_day": 15,
      "barangay_code": "BGY001",
      "status": "Unused",
      "rebate_date": "2025-10-15"
    }
  ]
}
```

#### Create Mass Rebate
```http
POST /api/mass-rebates
Content-Type: application/json

{
  "rebate_days": 3,
  "billing_day": 15,
  "barangay_code": "BGY001",
  "rebate_date": "2025-10-15",
  "description": "3-day service interruption rebate",
  "remarks": "Power outage compensation"
}

Response:
{
  "success": true,
  "message": "Mass rebate created successfully",
  "data": { ... }
}
```

#### Mark Rebate as Used
```http
POST /api/mass-rebates/{id}/mark-used
```

---

### Installment Schedules

#### List Installment Schedules
```http
GET /api/installment-schedules
Query Parameters:
  - installment_id (optional)
  - status (optional): pending, paid, overdue
```

#### Generate Payment Schedules
```http
POST /api/installment-schedules/generate
Content-Type: application/json

{
  "installment_id": 1
}

Response:
{
  "success": true,
  "message": "Generated 12 payment schedules",
  "data": [
    {
      "id": 1,
      "installment_id": 1,
      "installment_no": 1,
      "due_date": "2025-11-01",
      "amount": 500.00,
      "status": "pending"
    },
    ...
  ]
}
```

#### Get Schedules by Account
```http
GET /api/installment-schedules/account/{accountId}
```

#### Update Schedule
```http
PUT /api/installment-schedules/{id}
Content-Type: application/json

{
  "status": "paid",
  "invoice_id": "2510150800"
}
```

---

### Discounts

#### List Discounts
```http
GET /api/discounts
Query Parameters:
  - account_id (optional)
  - status (optional): Unused, Used, Permanent, Monthly
```

#### Create Discount
```http
POST /api/discounts
Content-Type: application/json

{
  "account_id": 123,
  "discount_amount": 200.00,
  "status": "Monthly",
  "remaining": 3,
  "remarks": "3-month promotional discount"
}
```

---

### Service Charges

#### List Service Charges
```http
GET /api/service-charges
Query Parameters:
  - account_id (optional)
  - status (optional): Unused, Used
```

#### Create Service Charge
```http
POST /api/service-charges
Content-Type: application/json

{
  "account_id": 123,
  "service_charge": 250.00,
  "remarks": "Technician visit fee"
}
```

---

### Installments (Enhanced)

#### List Installments
```http
GET /api/installments
Query Parameters:
  - account_id (optional)
  - status (optional): active, completed, cancelled
```

#### Create Installment
```http
POST /api/installments
Content-Type: application/json

{
  "account_id": 123,
  "total_balance": 6000.00,
  "months_to_pay": 12,
  "start_date": "2025-11-01",
  "remarks": "Installation fee installment"
}

Response:
{
  "success": true,
  "message": "Installment created successfully",
  "data": {
    "id": 1,
    "account_id": 123,
    "total_balance": 6000.00,
    "months_to_pay": 12,
    "monthly_payment": 500.00,
    "status": "active"
  }
}
```

#### Get Installment with Schedules
```http
GET /api/installments/{id}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "account_id": 123,
    "monthly_payment": 500.00,
    "status": "active",
    "schedules": [
      {
        "id": 1,
        "installment_no": 1,
        "due_date": "2025-11-01",
        "amount": 500.00,
        "status": "paid",
        "invoice_id": "2511010800"
      },
      {
        "id": 2,
        "installment_no": 2,
        "due_date": "2025-12-01",
        "amount": 500.00,
        "status": "pending",
        "invoice_id": null
      }
    ]
  }
}
```

---

## Debug & Testing Endpoints

### Test Invoice ID Generation
```http
GET /api/billing-generation/test-invoice-id

Response:
{
  "success": true,
  "invoice_id": "2510151400",
  "date": "2025-10-15 14:00:00",
  "format": "YYMMDDHHXXXX"
}
```

### Debug Billing Calculations
```http
GET /api/billing-generation/debug-calculations/{accountId}

Response:
{
  "success": true,
  "account": { ... },
  "plan": { ... },
  "calculations": {
    "monthly_fee": 1599.00,
    "billing_day": 15,
    "account_balance": 1500.00,
    "date_installed": "2025-09-01",
    "balance_update_date": null
  }
}
```

### Check Enhanced Features
```http
GET /api/debug/billing-features

Response:
{
  "success": true,
  "message": "Enhanced billing features available",
  "features": {
    "installment_tracking": true,
    "advanced_payments": true,
    "mass_rebates": true,
    "invoice_id_generation": true,
    "payment_received_tracking": true
  },
  "endpoints": { ... }
}
```

---

## How It Works During Billing Generation

### Installment Tracking
When an invoice is generated:
1. Service finds the installment with status "active"
2. Finds the next "pending" schedule (ordered by installment_no)
3. Adds the schedule amount to charges
4. Updates the schedule:
   - `invoice_id` = generated invoice ID
   - `status` = "paid"
5. If no more pending schedules, marks installment as "completed"

### Advanced Payments
When an invoice is generated:
1. Service finds advanced payments for current month
2. Filters by `payment_month` matching current month name
3. Applies payment amount as deduction
4. Updates payment:
   - `status` = "Used"
   - `invoice_used_id` = generated invoice ID

### Mass Rebates
When an invoice is generated:
1. Service finds rebates for:
   - Matching barangay_code OR "All"
   - Matching billing_day
   - Status "Unused"
2. Calculates rebate: (monthly_fee / 30) × rebate_days
3. Applies rebate as deduction
4. Marks rebate as "Used" (done separately, not per account)

### Invoice ID Format
```
YYMMDDHHXXXX
25 10 15 14 0000
│  │  │  │  └─── Random/Sequential (currently fixed 0000)
│  │  │  └────── Hour (24h format)
│  │  └───────── Day
│  └──────────── Month
└─────────────── Year (last 2 digits)
```

### Payment Received Tracking
When generating SOA:
1. Service finds last month's invoice
2. Retrieves `received_payment` value
3. Sets as `payment_received_previous` in SOA

---

## Frontend Integration Guide

### 1. Installment Management

**Create Installment with Schedules:**
```javascript
// Step 1: Create installment
const installment = await api.post('/installments', {
  account_id: 123,
  total_balance: 6000,
  months_to_pay: 12,
  start_date: '2025-11-01'
});

// Step 2: Generate payment schedules
await api.post('/installment-schedules/generate', {
  installment_id: installment.data.id
});

// Step 3: View schedules
const schedules = await api.get(`/installment-schedules?installment_id=${installment.data.id}`);
```

**Display Installment Progress:**
```javascript
const installment = await api.get(`/installments/${id}`);

const paid = installment.schedules.filter(s => s.status === 'paid').length;
const total = installment.schedules.length;
const progress = (paid / total) * 100;

console.log(`Payment Progress: ${progress}% (${paid}/${total} months)`);
```

### 2. Advanced Payment Management

**Add Advanced Payment:**
```javascript
await api.post('/advanced-payments', {
  account_id: 123,
  payment_amount: 1599.00,
  payment_month: 'November',
  payment_date: '2025-10-15',
  remarks: 'Holiday pre-payment'
});
```

**Check Applied Payments:**
```javascript
const payments = await api.get('/advanced-payments', {
  params: {
    account_id: 123,
    status: 'Used'
  }
});
```

### 3. Mass Rebate Application

**Create Rebate:**
```javascript
await api.post('/mass-rebates', {
  rebate_days: 3,
  billing_day: 15,
  barangay_code: 'BGY001', // or 'All' for all barangays
  rebate_date: '2025-10-15',
  description: 'Service interruption compensation'
});
```

**View Rebates by Barangay:**
```javascript
const rebates = await api.get('/mass-rebates', {
  params: {
    barangay_code: 'BGY001',
    status: 'Unused'
  }
});
```

### 4. Generate Billings

```javascript
// Generate for specific day
const result = await api.post('/billing-generation/generate-for-day', {
  billing_day: 15
});

console.log(`Generated: ${result.invoices.success} invoices, ${result.statements.success} SOAs`);

// Check for errors
if (result.invoices.failed > 0) {
  console.error('Failed accounts:', result.invoices.errors);
}
```

---

## Migration Steps

1. Run new migrations:
```bash
php artisan migrate
```

2. Verify tables created:
```bash
php artisan tinker
>>> Schema::hasTable('advanced_payments');
>>> Schema::hasTable('mass_rebates');
>>> Schema::hasTable('installment_schedules');
```

3. Test API endpoints:
```bash
curl http://localhost:8000/api/debug/billing-features
```

4. Create test data and generate billing

---

## Notes

- Invoice IDs are currently using fixed "0000" suffix
- Mass rebates apply to all accounts in matching barangays
- Installment schedules must be generated manually after creating installment
- Advanced payments are matched by exact month name (e.g., "October")
- Payment received tracking only looks at previous month's invoice

---

## Support

Check logs for detailed billing generation information:
```bash
tail -f storage/logs/laravel.log | grep "billing generation"
```
