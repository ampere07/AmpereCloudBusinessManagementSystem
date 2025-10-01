# Database Setup Instructions

## Running Migrations and Seeders

### 1. Run All Migrations
```bash
cd backend
php artisan migrate
```

### 2. Seed Initial Data (Recommended)
This will create admin user, lookup tables, and sample data:
```bash
php artisan db:seed
```

Or specifically run:
```bash
php artisan db:seed --class=InitialDataSeeder
```

### 3. Create Admin User Only
If you only need the admin user without other data:
```bash
php artisan db:seed --class=AdminUserOnlySeeder
```

## Login Credentials

After seeding, you can login with:
- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `admin@amperecloud.com`

## What Gets Seeded

The `InitialDataSeeder` creates:
- Default organization (Ampere Cloud)
- Administrator role
- Main Office group
- Admin user
- Billing status options (Active, Disconnected, Suspended, Pending)
- Usage types (Residential, Business)
- Payment methods (Cash, Bank Transfer, GCash, PayMaya, Credit Card)
- Sample internet plan (Basic Plan 25Mbps - ₱999)
- Inventory categories (Routers, Cables, Tools)
- Expenses categories (Equipment Purchase, Utilities, Maintenance, Salaries)
- Support concerns (No Internet, Slow Connection, etc.)
- Repair categories
- Status remarks

## Reset Database (If Needed)

To start fresh:
```bash
php artisan migrate:fresh --seed
```

This will drop all tables, recreate them, and run all seeders.

## Troubleshooting

### Foreign Key Errors
If you encounter foreign key errors:
1. Make sure all migrations run successfully first
2. The foreign keys migration (999999) runs last
3. Check that referenced tables exist before seeding

### Login Issues (Wrong Credentials)
If you cannot login with the admin credentials:

**Quick Fix:** Run this command to reset the admin password:
```bash
php artisan db:seed --class=FixAdminPasswordSeeder
```

This will update the existing admin user's password to the correct hash.

**Alternative:** Delete the admin user and recreate:
```sql
DELETE FROM users WHERE username = 'admin';
```
Then run:
```bash
php artisan db:seed --class=AdminUserOnlySeeder
```

## Security Note

**Important:** Change the admin password immediately after first login in a production environment.
