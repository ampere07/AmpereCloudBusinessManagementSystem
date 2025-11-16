# Installation Steps for Google Maps Integration

## 1. Install Google Maps TypeScript Types

Run the following command in the frontend directory:

```bash
npm install --save-dev @types/google.maps
```

## 2. Update Google Maps API Key

Edit `frontend/src/config/maps.ts` and replace the API key:

```typescript
export const GOOGLE_MAPS_API_KEY = 'YOUR_ACTUAL_GOOGLE_MAPS_API_KEY';
```

## 3. Build and Test

```bash
cd frontend
npm install
npm start
```

## 4. Verify Installation

1. Navigate to the LCP/NAP Location page
2. Confirm the map loads with Google Maps
3. Test clicking on the map to select coordinates
4. Test adding a new location with coordinates

## Files Modified

### New Files Created:
- `frontend/src/config/maps.ts` - Google Maps API key configuration
- `frontend/src/types/google-maps.d.ts` - TypeScript declarations
- `GOOGLE_MAPS_SETUP.md` - Complete setup documentation

### Files Modified:
- `frontend/src/pages/LcpNapLocation.tsx` - Main map view migrated to Google Maps
- `frontend/src/modals/AddLcpNapLocationModal.tsx` - Add location modal migrated to Google Maps

## Changes Summary

### Removed OpenStreetMap Dependencies:
- Leaflet CSS and JavaScript libraries
- Leaflet marker and map initialization code
- OpenStreetMap tile layer configuration

### Added Google Maps Features:
- Google Maps JavaScript API integration
- Custom dark theme styling
- Proper TypeScript typing
- Centralized API key management
- Info windows for marker popups
- Click event handling for coordinate selection

## Next Steps

1. Obtain Google Maps API key from Google Cloud Console
2. Enable Maps JavaScript API
3. Configure API key restrictions
4. Update `maps.ts` with actual API key
5. Test thoroughly in development
6. Deploy to production

## Rollback Instructions

If you need to revert to OpenStreetMap:

1. Check out the previous commit before this change
2. Or manually restore the old Leaflet implementation
3. Remove Google Maps configuration files

## Support

For issues or questions:
1. Check `GOOGLE_MAPS_SETUP.md` for detailed documentation
2. Review Google Maps JavaScript API documentation
3. Check browser console for error messages
