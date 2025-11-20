# Google Maps Integration Setup Guide

## Overview
The LCP/NAP Location system has been migrated from OpenStreetMap to Google Maps for enhanced mapping capabilities.

## Prerequisites
1. Google Cloud Platform account
2. Google Maps JavaScript API enabled
3. Valid Google Maps API key

## Getting Your Google Maps API Key

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for the project

### Step 2: Enable Google Maps JavaScript API
1. Navigate to APIs & Services > Library
2. Search for "Maps JavaScript API"
3. Click Enable

### Step 3: Create API Credentials
1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > API Key
3. Copy the generated API key

### Step 4: Restrict Your API Key (Recommended)
1. Click on the API key to edit
2. Under "Application restrictions":
   - Choose "HTTP referrers"
   - Add your domains:
     - `https://atssfiber.ph/*`
     - `http://localhost:3000/*` (for development)
3. Under "API restrictions":
   - Choose "Restrict key"
   - Select "Maps JavaScript API"
4. Save changes

## Configuration

### Update API Key
Edit the file: `frontend/src/config/maps.ts`

```typescript
export const GOOGLE_MAPS_API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
```

Replace `YOUR_ACTUAL_API_KEY_HERE` with your Google Maps API key.

## Features Implemented

### Main Map View (LcpNapLocation.tsx)
- Interactive Google Maps with dark theme
- Custom green circular markers for locations
- Info windows with location details
- Automatic bounds fitting for multiple markers
- Click-to-view location details
- Resizable sidebar with location filtering

### Add Location Modal (AddLcpNapLocationModal.tsx)
- Interactive map for coordinate selection
- Click map to set coordinates
- Orange circular marker for selected location
- Info window with coordinates
- Auto-populate coordinates field

## Map Styling
Both maps feature a dark theme that matches the application design:
- Dark gray base colors
- Blue water features
- Custom marker colors (green for locations, orange for selection)
- Minimal controls for clean interface

## API Usage and Costs

### Pricing Tiers (as of 2025)
- First 28,000 map loads per month: FREE
- Beyond that: $7 per 1,000 map loads
- Static Maps: $2 per 1,000 requests

### Best Practices to Minimize Costs
1. Implement API key restrictions
2. Enable only required APIs
3. Use caching where possible
4. Monitor usage in Google Cloud Console

### Monitoring Usage
1. Go to Google Cloud Console
2. Navigate to APIs & Services > Dashboard
3. View usage statistics for Maps JavaScript API

## Testing

### Local Development
1. Update `maps.ts` with your API key
2. Start development server: `npm start`
3. Navigate to LCP/NAP Location page
4. Verify map loads correctly
5. Test clicking on map to select coordinates
6. Test adding new locations

### Production Deployment
1. Ensure API key restrictions include production domain
2. Build application: `npm run build`
3. Deploy to production
4. Verify map functionality on live site

## Troubleshooting

### Map Not Loading
- Check browser console for errors
- Verify API key is correct in `maps.ts`
- Ensure Maps JavaScript API is enabled
- Check API key restrictions allow your domain

### "This page cannot load Google Maps correctly"
- API key missing or incorrect
- Billing not enabled on Google Cloud project
- API key restrictions too strict

### Markers Not Appearing
- Check browser console for coordinate parsing errors
- Verify coordinates format: "latitude, longitude"
- Ensure valid latitude (-90 to 90) and longitude (-180 to 180)

### Click Events Not Working
- Clear browser cache
- Check for JavaScript errors in console
- Verify Google Maps API loaded successfully

## Migration Notes

### Changes from OpenStreetMap
1. Script loading: Leaflet → Google Maps JavaScript API
2. Map initialization: L.map() → new google.maps.Map()
3. Markers: L.marker() → new google.maps.Marker()
4. Events: map.on() → map.addListener()
5. Popups: marker.bindPopup() → google.maps.InfoWindow()

### Code Structure
- Centralized API key in `config/maps.ts`
- TypeScript types for Google Maps objects
- Consistent dark theme across both maps
- Proper cleanup on component unmount

## Future Enhancements

### Potential Improvements
1. Clustering for many markers
2. Drawing tools for coverage areas
3. Street View integration
4. Directions between locations
5. Geocoding for address lookup
6. Custom map styles with JSON
7. Heatmap visualization

### Advanced Features
- Real-time location tracking
- Route optimization
- Distance calculations
- Custom overlay layers
- KML/GeoJSON support

## Support Resources

### Documentation
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [TypeScript Types](https://www.npmjs.com/package/@types/google.maps)
- [Marker Documentation](https://developers.google.com/maps/documentation/javascript/markers)

### Common Issues
- [Troubleshooting Guide](https://developers.google.com/maps/documentation/javascript/error-messages)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)

## Security Considerations

1. Never commit API keys to version control
2. Use environment variables for sensitive data
3. Implement API key restrictions
4. Monitor usage for unexpected spikes
5. Rotate API keys periodically
6. Use separate keys for development and production

## Version Information
- Google Maps JavaScript API: Latest
- Implementation Date: November 2025
- TypeScript Support: Full typing with @types/google.maps
