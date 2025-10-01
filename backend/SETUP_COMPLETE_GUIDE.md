# Database Setup and Login Fix

## Issues Found and Fixed

### 1. Missing Pivot Tables
- Created `user_roles` pivot table
- Created `user_groups` pivot table

### 2. Missing Activity Logs Table
- Created `activity_logs` table for login tracking

### 3. Model Configuration Issues
- Fixed Group model to use `group_list` table
- Fixed Role model to use `id` as primary key instead of `role_id`
- Fixed Group model to use `id` as primary key instead of `group_id`

### 4. Seeder Updates
- Updated to use pivot tables instead of direct role_id/group_id in users table
- Fixed password hashing

## Complete Setup Instructions

### Step 1: Run New Migrations
```bash
cd backend
php artisan migrate
```

This will create:
- `activity_logs` table
- `user_roles` pivot table
- `user_groups` pivot table
- All foreign key relationships

### Step 2: Seed Initial Data
```bash
php artisan db:seed --class=InitialDataSeeder
```

Or if you just need the admin user:
```bash
php artisan db:seed --class=AdminUserOnlySeeder
```

### Step 3: Test Login

**Login Credentials:**
- **Username:** `admin`
- **Password:** `admin123`

**Endpoints:**
- Production: `POST http://localhost:8000/api/login`
- Debug: `POST http://localhost:8000/api/login-debug`

## If You Already Have Data

If you already ran the seeders before these fixes:

### Option 1: Fresh Start (Recommended)
```bash
php artisan migrate:fresh --seed
```

This will drop all tables, recreate them, and run all seeders.

### Option 2: Fix Existing Data

1. Run new migrations only:
```bash
php artisan migrate
```

2. Delete existing admin user:
```sql
DELETE FROM users WHERE username = 'admin';
```

3. Re-seed admin user:
```bash
php artisan db:seed --class=AdminUserOnlySeeder
```

## Database Structure

### Users Table
- Stores user basic info
- `role_id` and `group_id` columns are nullable (not used directly)
- Relationships managed through pivot tables

### User Roles Pivot Table
```
user_roles:
- id
- user_id (references users.id)
- role_id (references roles.id)
- created_at
```

### User Groups Pivot Table
```
user_groups:
- id
- user_id (references users.id)
- group_id (references group_list.id)
- created_at
```

## Troubleshooting

### 500 Error on Login
If you get a 500 error, check:
1. Are all migrations run? `php artisan migrate:status`
2. Do the pivot tables exist? Check `user_roles` and `user_groups`
3. Does `activity_logs` table exist?

### Wrong Credentials
If login shows "wrong credentials":
1. Run: `php artisan db:seed --class=FixAdminPasswordSeeder`
2. Or delete and recreate admin user

### Debug Login
Use the debug endpoint to see exactly where it fails:
```bash
POST http://localhost:8000/api/login-debug
Body:
{
  "email": "admin",
  "password": "admin123"
}
```

The response will show which step failed.

## What Changed

1. **Group Model** - Now points to `group_list` table
2. **Role Model** - Uses `id` instead of `role_id`
3. **Group Model** - Uses `id` instead of `group_id`
4. **Pivot Tables** - Created to properly manage many-to-many relationships
5. **Activity Logs** - Created for tracking user actions
6. **Seeders** - Updated to use pivot tables

## Next Steps

After successful login:
1. Change admin password immediately
2. Create additional users as needed
3. Set up proper roles and permissions
4. Configure organization details
