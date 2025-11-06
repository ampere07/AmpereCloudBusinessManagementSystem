import React, { useState, useEffect, useRef } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import AddLcpNapLocationModal from '../modals/AddLcpNapLocationModal';

interface LocationMarker {
  id: number;
  lcpnap_name: string;
  lcp_name: string;
  nap_name: string;
  coordinates: string;
  latitude: number;
  longitude: number;
  street?: string;
  city?: string;
  region?: string;
  barangay?: string;
  port_total?: number;
  reading_image_url?: string;
  image1_url?: string;
  image2_url?: string;
  modified_by?: string;
  modified_date?: string;
}

interface LcpNapGroup {
  lcpnap_id: number;
  lcpnap_name: string;
  locations: LocationMarker[];
  count: number;
}

interface LcpNapItem {
  id: number;
  name: string;
  count: number;
}

const LcpNapLocation: React.FC = () => {
  const [markers, setMarkers] = useState<LocationMarker[]>([]);
  const [lcpNapGroups, setLcpNapGroups] = useState<LcpNapGroup[]>([]);
  const [selectedLcpNapId, setSelectedLcpNapId] = useState<number | string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(256);
  const [isResizingSidebar, setIsResizingSidebar] = useState<boolean>(false);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any[]>([]);
  const sidebarStartXRef = useRef<number>(0);
  const sidebarStartWidthRef = useRef<number>(0);

  const API_BASE_URL = 'https://backend.atssfiber.ph/api';

  useEffect(() => {
    loadMapScript();
    loadLocations();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersLayerRef.current = [];
      setIsMapReady(false);
    };
  }, []);

  useEffect(() => {
    if (markers.length > 0) {
      groupLocationsByLcpNap();
    }
  }, [markers]);

  useEffect(() => {
    if (isMapReady && markers.length > 0 && selectedLcpNapId === 'all') {
      updateMapMarkers(markers);
    }
  }, [isMapReady]);

  useEffect(() => {
    if (!isResizingSidebar) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingSidebar) return;
      
      const diff = e.clientX - sidebarStartXRef.current;
      const newWidth = Math.max(200, Math.min(500, sidebarStartWidthRef.current + diff));
      
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingSidebar]);

  const loadMapScript = () => {
    const existingCSS = document.getElementById('leaflet-css');
    const existingJS = document.getElementById('leaflet-js');

    if (!existingCSS) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!existingJS) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else if ((window as any).L && !mapInstanceRef.current) {
      initializeMap();
    }
  };

  const initializeMap = () => {
    if (!mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const L = (window as any).L;
    
    try {
      const map = L.map(mapRef.current).setView([12.8797, 121.7740], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      map.on('zoomend', () => {
        updateMarkerSizes();
      });

      mapInstanceRef.current = map;
      setIsMapReady(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      mapInstanceRef.current = null;
      setIsMapReady(false);
    }
  };

  const parseCoordinates = (coordString: string): { latitude: number; longitude: number } | null => {
    if (!coordString) return null;
    
    const coords = coordString.split(',').map(c => c.trim());
    if (coords.length !== 2) return null;
    
    const latitude = parseFloat(coords[0]);
    const longitude = parseFloat(coords[1]);
    
    if (isNaN(latitude) || isNaN(longitude)) return null;
    
    return { latitude, longitude };
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
        const validMarkers = data.data
          .map((item: any) => {
            const coords = parseCoordinates(item.coordinates);
            if (!coords) return null;
            
            return {
              id: item.id,
              lcpnap_name: item.lcpnap_name,
              lcp_name: item.lcp_name || 'N/A',
              nap_name: item.nap_name || 'N/A',
              coordinates: item.coordinates,
              latitude: coords.latitude,
              longitude: coords.longitude,
              street: item.street,
              city: item.city,
              region: item.region,
              barangay: item.barangay,
              port_total: item.port_total,
              reading_image_url: item.reading_image_url,
              image1_url: item.image1_url,
              image2_url: item.image2_url,
              modified_by: item.modified_by,
              modified_date: item.modified_date
            };
          })
          .filter((marker: LocationMarker | null): marker is LocationMarker => marker !== null);
        
        setMarkers(validMarkers);
        
        if (mapInstanceRef.current && (window as any).L) {
          updateMapMarkers(validMarkers);
        } else {
          setTimeout(() => {
            if (mapInstanceRef.current && (window as any).L) {
              updateMapMarkers(validMarkers);
            }
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupLocationsByLcpNap = () => {
    const grouped: { [key: string]: LcpNapGroup } = {};

    markers.forEach(marker => {
      if (!grouped[marker.lcpnap_name]) {
        grouped[marker.lcpnap_name] = {
          lcpnap_id: marker.id,
          lcpnap_name: marker.lcpnap_name,
          locations: [],
          count: 0
        };
      }
      grouped[marker.lcpnap_name].locations.push(marker);
      grouped[marker.lcpnap_name].count++;
    });

    const groupArray = Object.values(grouped).sort((a, b) => 
      a.lcpnap_name.localeCompare(b.lcpnap_name)
    );

    setLcpNapGroups(groupArray);
  };

  const getMarkerSize = (zoomLevel: number) => {
    if (zoomLevel >= 15) return { width: 32, height: 44, iconSize: [32, 44], iconAnchor: [16, 44] };
    if (zoomLevel >= 12) return { width: 24, height: 33, iconSize: [24, 33], iconAnchor: [12, 33] };
    if (zoomLevel >= 9) return { width: 18, height: 25, iconSize: [18, 25], iconAnchor: [9, 25] };
    if (zoomLevel >= 6) return { width: 14, height: 19, iconSize: [14, 19], iconAnchor: [7, 19] };
    return { width: 10, height: 14, iconSize: [10, 14], iconAnchor: [5, 14] };
  };

  const createMarkerIcon = (zoomLevel: number) => {
    const L = (window as any).L;
    const size = getMarkerSize(zoomLevel);
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <svg width="${size.width}" height="${size.height}" viewBox="0 0 32 44" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 13 16 28 16 28s16-15 16-28c0-8.837-7.163-16-16-16z" fill="#22c55e" stroke="#fff" stroke-width="2"/>
          <circle cx="16" cy="16" r="6" fill="#fff"/>
        </svg>
      `,
      iconSize: size.iconSize,
      iconAnchor: size.iconAnchor,
      popupAnchor: [0, -size.iconAnchor[1]]
    });
  };

  const updateMarkerSizes = () => {
    if (!mapInstanceRef.current) return;
    
    const L = (window as any).L;
    if (!L) return;
    
    const currentZoom = mapInstanceRef.current.getZoom();
    const newIcon = createMarkerIcon(currentZoom);
    
    markersLayerRef.current.forEach(marker => {
      marker.setIcon(newIcon);
    });
  };

  const updateMapMarkers = (locations: LocationMarker[]) => {
    if (!mapInstanceRef.current) {
      console.warn('Map instance not ready yet');
      return;
    }

    const L = (window as any).L;
    if (!L) {
      console.warn('Leaflet library not loaded yet');
      return;
    }
    
    markersLayerRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersLayerRef.current = [];

    const currentZoom = mapInstanceRef.current.getZoom();
    const customIcon = createMarkerIcon(currentZoom);

    locations.forEach(location => {
      const marker = L.marker([location.latitude, location.longitude], { icon: customIcon })
        .addTo(mapInstanceRef.current);

      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
            ${location.lcpnap_name}
          </h3>
          <div style="font-size: 14px; color: #4b5563; line-height: 1.6;">
            <div style="margin-bottom: 4px;">
              <strong>LCP:</strong> ${location.lcp_name}
            </div>
            <div style="margin-bottom: 4px;">
              <strong>NAP:</strong> ${location.nap_name}
            </div>
            ${location.street ? `
              <div style="margin-bottom: 4px;">
                <strong>Street:</strong> ${location.street}
              </div>
            ` : ''}
            ${location.barangay ? `
              <div style="margin-bottom: 4px;">
                <strong>Barangay:</strong> ${location.barangay}
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
            ${location.port_total ? `
              <div style="margin-bottom: 4px;">
                <strong>Port Total:</strong> ${location.port_total}
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

  const handleLcpNapSelect = (lcpNapId: number | string) => {
    setSelectedLcpNapId(lcpNapId);
    
    if (lcpNapId === 'all') {
      updateMapMarkers(markers);
    } else {
      const selectedGroup = lcpNapGroups.find(g => g.lcpnap_id === lcpNapId);
      if (selectedGroup) {
        updateMapMarkers(selectedGroup.locations);
      }
    }
  };

  const handleLocationSelect = (location: LocationMarker) => {
    if (!mapInstanceRef.current) return;
    
    const L = (window as any).L;
    mapInstanceRef.current.setView([location.latitude, location.longitude], 15);
    
    const marker = markersLayerRef.current.find(m => {
      const latLng = m.getLatLng();
      return latLng.lat === location.latitude && latLng.lng === location.longitude;
    });
    
    if (marker) {
      marker.openPopup();
    }
  };

  const handleMouseDownSidebarResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingSidebar(true);
    sidebarStartXRef.current = e.clientX;
    sidebarStartWidthRef.current = sidebarWidth;
  };

  const handleSaveLocation = () => {
    loadLocations();
  };

  const lcpNapItems: LcpNapItem[] = [
    {
      id: 0,
      name: 'All',
      count: markers.length
    },
    ...lcpNapGroups.map(group => ({
      id: group.lcpnap_id,
      name: group.lcpnap_name,
      count: group.count
    }))
  ];

  const getSelectedGroup = () => {
    if (selectedLcpNapId === 'all') return null;
    return lcpNapGroups.find(g => g.lcpnap_id === selectedLcpNapId);
  };

  const selectedGroup = getSelectedGroup();

  return (
    <div className="bg-gray-950 h-full flex overflow-hidden">
      <div className="bg-gray-900 border-r border-gray-700 flex-shrink-0 flex flex-col relative" style={{ width: `${sidebarWidth}px` }}>
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-white">LCP/NAP Locations</h2>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {lcpNapItems.map((item) => (
            <button
              key={item.id === 0 ? 'all' : item.id}
              onClick={() => handleLcpNapSelect(item.id === 0 ? 'all' : item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-gray-800 ${
                (item.id === 0 && selectedLcpNapId === 'all') || (item.id !== 0 && selectedLcpNapId === item.id)
                  ? 'bg-orange-500 bg-opacity-20 text-orange-400'
                  : 'text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{item.name}</span>
              </div>
              {item.count > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  (item.id === 0 && selectedLcpNapId === 'all') || (item.id !== 0 && selectedLcpNapId === item.id)
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {selectedGroup && selectedGroup.locations.length > 0 && (
          <div className="border-t border-gray-700 bg-gray-800 max-h-64 overflow-y-auto">
            <div className="px-4 py-2 bg-gray-850 border-b border-gray-700">
              <div className="text-xs text-gray-400 font-medium">Locations</div>
            </div>
            {selectedGroup.locations.map(location => (
              <button
                key={location.id}
                onClick={() => handleLocationSelect(location)}
                className="w-full px-4 py-2 text-left flex items-start gap-2 hover:bg-gray-700 transition-colors text-sm"
              >
                <MapPin className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-gray-300 truncate">{location.lcpnap_name}</div>
                  {location.city && (
                    <div className="text-xs text-gray-500 truncate">{location.city}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
        
        <div 
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-orange-500 transition-colors z-10"
          onMouseDown={handleMouseDownSidebarResize}
        />
      </div>

      <div className="bg-gray-900 overflow-hidden flex-1">
        <div className="flex flex-col h-full">
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-semibold">Map View</h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded flex items-center gap-2 text-sm"
              >
                <MapPin className="h-4 w-4" />
                Add LCPNAP
              </button>
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
        </div>
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
