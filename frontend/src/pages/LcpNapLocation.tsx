import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Plus, Filter } from 'lucide-react';
import AddLcpNapLocationModal from '../modals/AddLcpNapLocationModal';

interface LocationMarker {
  id: number;
  lcp_nap_id: number;
  lcpnap_name: string;
  lcp_name: string;
  nap_name: string;
  location_name: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  region?: string;
}

const LcpNapLocation: React.FC = () => {
  const [markers, setMarkers] = useState<LocationMarker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any[]>([]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    loadMapScript();
    loadLocations();
  }, []);

  const loadMapScript = () => {
    if (document.getElementById('leaflet-css')) return;

    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = initializeMap;
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    
    const map = L.map(mapRef.current).setView([12.8797, 121.7740], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;
  };

  const loadLocations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/lcp-nap-locations`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const validMarkers = data.data.filter((item: any) => 
          item.latitude && item.longitude && 
          !isNaN(parseFloat(item.latitude)) && !isNaN(parseFloat(item.longitude))
        ).map((item: any) => ({
          id: item.id,
          lcp_nap_id: item.lcp_nap_id,
          lcpnap_name: item.lcpnap_name,
          lcp_name: item.lcp_name,
          nap_name: item.nap_name,
          location_name: item.location_name,
          latitude: parseFloat(item.latitude),
          longitude: parseFloat(item.longitude),
          address: item.address,
          city: item.city,
          region: item.region
        }));
        
        setMarkers(validMarkers);
        updateMapMarkers(validMarkers);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMapMarkers = (locations: LocationMarker[]) => {
    if (!mapInstanceRef.current) return;

    const L = (window as any).L;
    
    markersLayerRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersLayerRef.current = [];

    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <svg width="32" height="44" viewBox="0 0 32 44" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 13 16 28 16 28s16-15 16-28c0-8.837-7.163-16-16-16z" fill="#22c55e" stroke="#fff" stroke-width="2"/>
          <circle cx="16" cy="16" r="6" fill="#fff"/>
        </svg>
      `,
      iconSize: [32, 44],
      iconAnchor: [16, 44],
      popupAnchor: [0, -44]
    });

    locations.forEach(location => {
      const marker = L.marker([location.latitude, location.longitude], { icon: customIcon })
        .addTo(mapInstanceRef.current);

      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
            ${location.location_name}
          </h3>
          <div style="font-size: 14px; color: #4b5563; line-height: 1.6;">
            <div style="margin-bottom: 4px;">
              <strong>LCP NAP:</strong> ${location.lcpnap_name}
            </div>
            <div style="margin-bottom: 4px;">
              <strong>LCP:</strong> ${location.lcp_name || 'N/A'}
            </div>
            <div style="margin-bottom: 4px;">
              <strong>NAP:</strong> ${location.nap_name || 'N/A'}
            </div>
            ${location.address ? `
              <div style="margin-bottom: 4px;">
                <strong>Address:</strong> ${location.address}
              </div>
            ` : ''}
            ${location.city ? `
              <div style="margin-bottom: 4px;">
                <strong>City:</strong> ${location.city}
              </div>
            ` : ''}
            ${location.region ? `
              <div style="margin-bottom: 4px;">
                <strong>Region:</strong> ${location.region}
              </div>
            ` : ''}
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
              ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      markersLayerRef.current.push(marker);
    });

    if (locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map(loc => [loc.latitude, loc.longitude])
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const resetMapView = () => {
    if (mapInstanceRef.current) {
      if (markers.length > 0) {
        const L = (window as any).L;
        const bounds = L.latLngBounds(
          markers.map(loc => [loc.latitude, loc.longitude])
        );
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      } else {
        mapInstanceRef.current.setView([12.8797, 121.7740], 6);
      }
    }
  };

  const handleSaveLocation = (locationData: any) => {
    console.log('Saving location:', locationData);
    loadLocations();
  };

  return (
    <div className="h-full flex flex-col bg-gray-950">
      <div className="flex-shrink-0 bg-gray-900 px-6 py-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            LCP/NAP Location
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
            <button
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Filter"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative z-0">
        <div 
          ref={mapRef} 
          className="absolute inset-0 w-full h-full z-0"
        />
        
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[1000]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="text-white text-sm">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      <AddLcpNapLocationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveLocation}
      />
    </div>
  );
};

export default LcpNapLocation;
