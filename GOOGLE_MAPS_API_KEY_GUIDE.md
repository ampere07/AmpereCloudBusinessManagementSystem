# Step-by-Step Guide: Getting Google Maps API Key

## Prerequisites
- Google Account (Gmail)
- Credit/Debit Card (for verification, $200 free monthly credit applies)

---

## Step 1: Access Google Cloud Console

1. Open your web browser
2. Go to **https://console.cloud.google.com/**
3. Sign in with your Google Account
4. Accept the Terms of Service if prompted

---

## Step 2: Create a New Project

1. Click the **project dropdown** at the top of the page (next to "Google Cloud")
2. Click **"NEW PROJECT"** button in the top right
3. Enter project details:
   - **Project name**: `AmpereCloudMaps` (or any name you prefer)
   - **Organization**: Leave as "No organization" (unless you have one)
   - **Location**: Leave as default
4. Click **"CREATE"** button
5. Wait for project creation (takes 10-30 seconds)
6. Select your new project from the project dropdown

---

## Step 3: Enable Billing (Required)

1. Click the **hamburger menu** (☰) in the top left
2. Go to **"Billing"**
3. Click **"LINK A BILLING ACCOUNT"**
4. If you have no billing account:
   - Click **"CREATE BILLING ACCOUNT"**
   - Enter your country
   - Click **"Continue"**
5. Enter payment information:
   - Account type: Individual or Business
   - Name and address
   - Credit/Debit card details
6. Click **"START MY FREE TRIAL"** or **"SUBMIT AND ENABLE BILLING"**

**Note**: You get $200 free credit per month. You will not be charged unless you exceed this limit and explicitly enable charging.

---

## Step 4: Enable Required APIs

### Enable Maps JavaScript API

1. Click the **hamburger menu** (☰) in the top left
2. Navigate to **"APIs & Services"** → **"Library"**
3. In the search bar, type: **"Maps JavaScript API"**
4. Click on **"Maps JavaScript API"** from the results
5. Click the **"ENABLE"** button
6. Wait for API to be enabled (5-10 seconds)

### Enable Geocoding API (Optional but Recommended)

1. Click **"APIs & Services"** → **"Library"** again
2. Search for: **"Geocoding API"**
3. Click on **"Geocoding API"**
4. Click **"ENABLE"**

### Enable Places API (Optional for future features)

1. Go back to **"APIs & Services"** → **"Library"**
2. Search for: **"Places API"**
3. Click on **"Places API"**
4. Click **"ENABLE"**

---

## Step 5: Create API Key

1. Click the **hamburger menu** (☰)
2. Go to **"APIs & Services"** → **"Credentials"**
3. Click **"+ CREATE CREDENTIALS"** at the top
4. Select **"API key"** from the dropdown
5. A dialog will appear with your API key
6. **COPY THE API KEY** immediately (you will need this)
7. The key will look like: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## Step 6: Restrict API Key (CRITICAL for Security)

### Application Restrictions

1. On the credentials page, click on your newly created API key
2. Under **"Application restrictions"**, select **"HTTP referrers (web sites)"**
3. Click **"ADD AN ITEM"**
4. Add the following referrers (one at a time):

   **For Production:**
   ```
   https://atssfiber.ph/*
   https://sync.atssfiber.ph/*
   ```

   **For Development:**
   ```
   http://localhost:3000/*
   http://127.0.0.1:3000/*
   ```

5. Click **"DONE"** after adding each referrer

### API Restrictions

1. Scroll down to **"API restrictions"**
2. Select **"Restrict key"**
3. Check the following APIs:
   - ✅ Maps JavaScript API
   - ✅ Geocoding API (if enabled)
   - ✅ Places API (if enabled)
4. Click **"SAVE"** at the bottom

**⚠️ IMPORTANT**: Wait 5 minutes for restrictions to take effect

---

## Step 7: Configure Your Application

1. Open your project in VS Code or your editor
2. Navigate to: `frontend/src/config/maps.ts`
3. Replace the API key:

```typescript
export const GOOGLE_MAPS_API_KEY = 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxx';
```

4. Save the file

---

## Step 8: Set Up Budget Alerts (Recommended)

1. Go to **"Billing"** from hamburger menu
2. Click on your billing account
3. Click **"Budgets & alerts"** in the left sidebar
4. Click **"CREATE BUDGET"**
5. Configure budget:
   - **Name**: Google Maps API Budget
   - **Time range**: Monthly
   - **Projects**: Select your project
   - **Services**: Maps JavaScript API
   - **Budget amount**: $50 (or your preferred limit)
6. Set alert thresholds:
   - 50% of budget: Email alert
   - 90% of budget: Email alert
   - 100% of budget: Email alert
7. Add your email address
8. Click **"FINISH"**

---

## Step 9: Test Your API Key

### Test in Browser Console

1. Open your browser
2. Press F12 to open Developer Console
3. Paste this code and press Enter:

```javascript
fetch(`https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE`)
  .then(response => response.text())
  .then(data => console.log('API Key is valid!'))
  .catch(error => console.error('API Key error:', error));
```

Replace `YOUR_API_KEY_HERE` with your actual key.

### Test in Your Application

1. Open terminal in your project folder
2. Navigate to frontend:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install --save-dev @types/google.maps
   ```
4. Start development server:
   ```bash
   npm start
   ```
5. Open browser to http://localhost:3000
6. Navigate to LCP/NAP Location page
7. Check if map loads correctly

---

## Verification Checklist

After completing all steps, verify:

- [ ] Google Cloud project created
- [ ] Billing account linked and enabled
- [ ] Maps JavaScript API enabled
- [ ] API key created and copied
- [ ] HTTP referrer restrictions added
- [ ] API restrictions configured
- [ ] Budget alerts set up
- [ ] API key added to `maps.ts`
- [ ] TypeScript types installed
- [ ] Application tested locally
- [ ] Map loads without errors

---

## Common Issues and Solutions

### Issue: "This page can't load Google Maps correctly"

**Solution:**
- Verify API key is correct in `maps.ts`
- Check that Maps JavaScript API is enabled
- Ensure billing is enabled
- Wait 5 minutes after setting restrictions

### Issue: "API key not valid"

**Solution:**
- Copy API key again from Google Cloud Console
- Remove any extra spaces when pasting
- Verify HTTP referrer restrictions match your domain
- Check if API restrictions include Maps JavaScript API

### Issue: "Billing must be enabled"

**Solution:**
- Go to Billing section in Google Cloud Console
- Link a billing account to your project
- Add valid payment method
- Accept terms and conditions

### Issue: Map loads but markers don't appear

**Solution:**
- Check browser console for errors
- Verify coordinate format: "latitude, longitude"
- Ensure valid coordinates (lat: -90 to 90, lng: -180 to 180)
- Check API restrictions allow your domain

### Issue: "RefererNotAllowedMapError"

**Solution:**
- Add your current domain to HTTP referrers list
- Include wildcard: `https://yourdomain.com/*`
- Wait 5 minutes for restrictions to propagate
- Clear browser cache and reload

---

## API Key Security Best Practices

### DO:
✅ Restrict API key by HTTP referrer
✅ Restrict API key to specific APIs
✅ Set up billing alerts
✅ Use separate keys for dev and production
✅ Monitor usage regularly
✅ Rotate keys periodically (every 90 days)

### DON'T:
❌ Commit API keys to GitHub
❌ Share API keys publicly
❌ Use unrestricted API keys
❌ Ignore usage alerts
❌ Use same key across multiple projects
❌ Expose keys in client-side code without restrictions

---

## Monitoring Your Usage

### View Usage Statistics

1. Go to **Google Cloud Console**
2. Navigate to **"APIs & Services"** → **"Dashboard"**
3. Click on **"Maps JavaScript API"**
4. View graphs showing:
   - Requests per day
   - Errors per day
   - Latency

### Check Current Costs

1. Go to **"Billing"** from hamburger menu
2. Click **"Reports"**
3. Filter by:
   - Time range: This month
   - Service: Maps JavaScript API
4. View estimated costs

---

## Cost Optimization Tips

1. **Use Static Maps** for non-interactive displays
2. **Implement Caching** for repeated requests
3. **Load Maps On-Demand** rather than on page load
4. **Use Viewport Restrictions** to limit map interactions
5. **Monitor Usage Weekly** through Google Cloud Console
6. **Set Conservative Budget Alerts** ($10, $25, $50)

---

## Free Tier Limits (Monthly)

| Service | Free Usage | Cost After Free Tier |
|---------|-----------|---------------------|
| Maps JavaScript API | 28,000 loads | $7 per 1,000 loads |
| Static Maps | 28,000 loads | $2 per 1,000 loads |
| Geocoding API | 40,000 requests | $5 per 1,000 requests |
| Places API | Varies | Varies by request type |

**Monthly Credit**: $200 (covers most small to medium applications)

---

## Additional Resources

- **Google Maps Platform Documentation**: https://developers.google.com/maps/documentation
- **Pricing Calculator**: https://mapsplatform.google.com/pricing/
- **Support Forum**: https://stackoverflow.com/questions/tagged/google-maps
- **API Key Best Practices**: https://developers.google.com/maps/api-security-best-practices

---

## Support

If you encounter issues:
1. Check Google Cloud Console for error messages
2. Review browser console for JavaScript errors
3. Verify all steps completed correctly
4. Check API usage and quota limits
5. Review billing status

For technical support:
- Google Maps Platform Support: https://developers.google.com/maps/support
- Stack Overflow: Use tag `google-maps`

---

**Completion Time**: 15-20 minutes
**Difficulty**: Easy to Moderate
**Cost**: Free (with $200 monthly credit)

---

## Next Steps After API Key Setup

1. Update `frontend/src/config/maps.ts` with your API key
2. Run `npm install --save-dev @types/google.maps`
3. Start development server: `npm start`
4. Test LCP/NAP Location page
5. Deploy to production
6. Monitor usage in first week
7. Adjust budget alerts as needed
