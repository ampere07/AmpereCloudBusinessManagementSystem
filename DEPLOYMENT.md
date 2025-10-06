# Production Deployment Guide

## Quick Deployment Summary

Your system will be deployed at: `https://atssfiber.ph/sync`
- Frontend (React): `https://atssfiber.ph/sync`
- Backend API (Laravel): `https://atssfiber.ph/sync/api`

## Server Structure

```
/home/username/
├── public_html/
│   └── sync/                      # Main deployment folder
│       ├── index.php              # Laravel entry point
│       ├── .htaccess              # Combined routing (from PRODUCTION.htaccess)
│       ├── index.html             # React entry point
│       ├── static/                # React assets
│       │   ├── css/
│       │   └── js/
│       ├── favicon.ico
│       └── manifest.json
├── backend/                       # Laravel backend (outside public)
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── routes/
│   ├── storage/
│   ├── vendor/
│   └── .env
```

## Deployment Steps

### 1. Build Frontend

```bash
cd frontend
npm run build
```

### 2. Prepare Files

**Backend files to upload (to `/home/username/backend/`):**
- All backend files EXCEPT the `public` folder
- app/
- bootstrap/
- config/
- database/
- routes/
- storage/
- vendor/
- .env (update for production)
- artisan
- composer.json

**Files for `/public_html/sync/`:**
- From `backend/public/`: index.php
- From project root: `PRODUCTION.htaccess` (rename to `.htaccess`)
- From `frontend/build/`: ALL files and folders
  - index.html
  - static/
  - favicon.ico
  - manifest.json
  - robots.txt
  - etc.

### 3. Upload to Server

**Option A: FTP/SFTP**
1. Upload backend folder to `/home/username/backend/`
2. Upload `backend/public/index.php` to `/public_html/sync/`
3. Upload `PRODUCTION.htaccess` to `/public_html/sync/.htaccess`
4. Upload all `frontend/build/*` contents to `/public_html/sync/`

**Option B: Git + SSH**
```bash
# On server
cd /home/username
git clone your-repo-url backend
cd backend
composer install --no-dev --optimize-autoloader
cd /public_html/sync
cp /home/username/backend/public/index.php .
cp /home/username/PRODUCTION.htaccess .htaccess
# Upload build files via FTP
```

### 4. Configure Laravel .env

Edit `/home/username/backend/.env`:

```env
APP_NAME="Ampere CBMS"
APP_ENV=production
APP_KEY=base64:WzclePhkDBL08xCAyz6oaMXcqKKmScZex6r3dcWAuHU=
APP_DEBUG=false
APP_URL=https://atssfiber.ph/sync

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=u450635736_AmpereSync
DB_USERNAME=u450635736_AmpereSync
DB_PASSWORD=N3wP@ssword00

SANCTUM_STATEFUL_DOMAINS=atssfiber.ph,www.atssfiber.ph
SESSION_DOMAIN=.atssfiber.ph

MAIL_FROM_ADDRESS="noreply@atssfiber.ph"
```

### 5. Update Laravel index.php

Edit `/public_html/sync/index.php` and update the paths:

```php
<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Update these paths to point to backend folder
require __DIR__.'/../../backend/vendor/autoload.php';

$app = require_once __DIR__.'/../../backend/bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
```

### 6. Set Permissions

```bash
# On server via SSH
cd /home/username/backend
chmod -R 755 storage
chmod -R 755 bootstrap/cache
chmod 644 .env

cd /public_html/sync
chmod 644 .htaccess
chmod 644 index.php
chmod 755 static
```

### 7. Run Laravel Commands

```bash
# On server via SSH
cd /home/username/backend
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan migrate --force
php artisan optimize
```

### 8. Verify Deployment

**Test URLs:**
- Frontend: https://atssfiber.ph/sync
- API Health: https://atssfiber.ph/sync/api/health
- Login: https://atssfiber.ph/sync (use interface)

**Expected Results:**
- ✅ Frontend loads React app
- ✅ API health returns JSON
- ✅ Login works
- ✅ Static assets load (CSS, JS)
- ✅ React routing works (refresh on any page)

## .htaccess Explanation

The `PRODUCTION.htaccess` file handles:
1. **API Routes** → Laravel (index.php)
2. **Static Files** → Served directly
3. **All Other Routes** → React (index.html)

This allows:
- `/sync/api/*` → Laravel backend
- `/sync/static/*` → React assets
- `/sync/*` → React app (including client-side routing)

## Troubleshooting

### Static Files 404

**Problem:** CSS/JS files not loading

**Solution:**
```bash
# Check paths in index.html
# Should be: /sync/static/css/...
# Verify build: npm run build
# Check homepage in package.json: "/sync"
```

### API 404 Errors

**Problem:** API routes return 404

**Solution:**
```bash
# Verify .htaccess is present
# Check mod_rewrite is enabled
# Verify index.php paths are correct
# Run: php artisan route:clear
```

### CORS Errors

**Problem:** Browser blocks API requests

**Solution:**
```bash
# Check backend/config/cors.php
# Verify SANCTUM_STATEFUL_DOMAINS in .env
# Run: php artisan config:clear
```

### React Router 404

**Problem:** Refresh on React routes gives 404

**Solution:**
```bash
# Verify .htaccess has React routing rules
# Check ErrorDocument is set
# Ensure mod_rewrite is enabled
```

### Database Connection Error

**Problem:** Cannot connect to database

**Solution:**
```bash
# Verify .env database credentials
# Test connection: php artisan tinker
# Check database exists
# Verify user permissions
```

## File Checklist

**In `/public_html/sync/`:**
- [ ] index.php (Laravel)
- [ ] .htaccess (from PRODUCTION.htaccess)
- [ ] index.html (React)
- [ ] static/ folder
- [ ] favicon.ico
- [ ] manifest.json
- [ ] All other React build files

**In `/home/username/backend/`:**
- [ ] All Laravel files
- [ ] .env configured
- [ ] storage/ writable
- [ ] vendor/ installed

## Post-Deployment

### Enable HTTPS (if not already)
```bash
# Most hosts provide free SSL via cPanel or Let's Encrypt
# Ensure APP_URL uses https://
```

### Monitoring
```bash
# Check Laravel logs
tail -f /home/username/backend/storage/logs/laravel.log

# Check error logs
tail -f /home/username/logs/error_log
```

### Maintenance Mode
```bash
# Enable maintenance
php artisan down

# Disable maintenance
php artisan up
```

## Quick Redeploy

When you need to update:

**Frontend only:**
```bash
cd frontend
npm run build
# Upload build/* to /public_html/sync/
```

**Backend only:**
```bash
# Upload changed files
# Run: php artisan config:clear
# Run: php artisan cache:clear
```

**Both:**
```bash
# Follow full deployment steps
# Or use deployment automation
```

Your system is now production-ready!
