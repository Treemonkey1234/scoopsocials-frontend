import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

interface MapComponentProps {
  onLocationSelect?: (location: { lat: number; lng: number; name: string }) => void;
  onMarkerClick?: (markerId: string) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
  markers?: Array<{
    id: string;
    lat: number;
    lng: number;
    title: string;
    description?: string;
    color?: string;
    category?: string;
    isSelected?: boolean;
  }>;
}

export interface MapComponentRef {
  centerOnMarker: (markerId: string) => void;
  centerOnCoordinates: (lat: number, lng: number, zoom?: number) => void;
}

const MapComponent = forwardRef<MapComponentRef, MapComponentProps>(({ 
  onLocationSelect, 
  onMarkerClick,
  initialCenter = [-98.5795, 39.8283], // Center of US
  initialZoom = 3,
  markers = []
}, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxAvailable, setMapboxAvailable] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    centerOnMarker: (markerId: string) => {
      if (!map.current) return;
      
      const marker = markers.find(m => m.id === markerId);
      if (marker) {
        map.current.flyTo({
          center: [marker.lng, marker.lat],
          zoom: 14,
          duration: 1000,
          essential: true,
          curve: 1.42, // Add a slight curve for smoother animation
          easing: (t: number) => t * (2 - t) // Ease-out function for natural feel
        });
      }
    },
    centerOnCoordinates: (lat: number, lng: number, zoom: number = 14) => {
      if (!map.current) return;
      
      console.log('MapComponent: Centering on coordinates:', { lat, lng, zoom });
      
      // Get current map center to determine if we need a dramatic animation
      const currentCenter = map.current.getCenter();
      const currentZoom = map.current.getZoom();
      
      console.log('Current map center:', currentCenter);
      console.log('Current zoom:', currentZoom);
      
      // Calculate distance to determine animation duration
      const distance = Math.sqrt(
        Math.pow(currentCenter.lng - lng, 2) + Math.pow(currentCenter.lat - lat, 2)
      );
      
      console.log('Distance to new location:', distance);
      
      // Use longer duration for longer distances
      const duration = Math.min(Math.max(distance * 1000, 1000), 3000);
      
      // Set moving state
      setIsMoving(true);
      
      map.current.flyTo({
        center: [lng, lat],
        zoom: zoom,
        duration: duration,
        essential: true,
        curve: 1.42, // Add a slight curve for smoother animation
        easing: (t: number) => t * (2 - t) // Ease-out function for natural feel
      });
      
      // Reset moving state after animation completes
      setTimeout(() => {
        setIsMoving(false);
      }, duration + 100);
    }
  }));

  useEffect(() => {
    // Load Mapbox if not available
    if (typeof window !== 'undefined' && !window.mapboxgl) {
      const script = document.createElement('script');
      script.src = '/mapbox-loader.js';
      script.onload = () => {
        // Wait for Mapbox to be loaded
        const checkMapbox = () => {
          if (window.mapboxgl) {
            setMapboxAvailable(true);
          } else {
            setTimeout(checkMapbox, 100);
          }
        };
        checkMapbox();
      };
      document.head.appendChild(script);
    } else if (window.mapboxgl) {
      setMapboxAvailable(true);
    }

    // Listen for mapbox loaded event
    const handleMapboxLoaded = () => {
      setMapboxAvailable(true);
    };

    window.addEventListener('mapboxLoaded', handleMapboxLoaded);
    return () => {
      window.removeEventListener('mapboxLoaded', handleMapboxLoaded);
    };
  }, []);

  useEffect(() => {
    // Initialize map when Mapbox is available
    if (!mapboxAvailable || !mapContainer.current || map.current) return;

    const mapboxgl = window.mapboxgl;
    
    // Set access token (this should be in environment variables)
    const MAPBOX_TOKEN = 'pk.eyJ1IjoidHJlZW1vbmtleTQ1NiIsImEiOiJjbWMwc3FodnIwNjJ6MmxwdWtpamFkbjVyIn0._yMY5crJh7ujrwoxkm3EVw';
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialCenter,
      zoom: initialZoom
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());

    // Add geolocation control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      })
    );

    map.current.on('load', () => {
      setMapLoaded(true);
      
      // Add markers if provided
      markers.forEach(marker => {
        const markerElement = new mapboxgl.Marker({
          color: marker.color || '#0891b2'
        })
          .setLngLat([marker.lng, marker.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <h3 class="font-semibold">${marker.title}</h3>
                ${marker.description ? `<p class="text-sm text-gray-600">${marker.description}</p>` : ''}
              `)
          )
          .addTo(map.current);

        // Add visual feedback for selected markers
        if (marker.isSelected) {
          const element = markerElement.getElement();
          element.classList.add('mapboxgl-marker-selected');
        }

        // Add click handler for marker
        if (onMarkerClick) {
          markerElement.getElement().addEventListener('click', () => {
            onMarkerClick(marker.id);
          });
        }
      });

      // Add click handler for location selection
      if (onLocationSelect) {
        map.current.on('click', async (e: any) => {
          const { lng, lat } = e.lngLat;
          
          try {
            // Reverse geocode to get location name
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
            );
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
              const locationName = data.features[0].place_name;
              onLocationSelect({ lat, lng, name: locationName });
            }
          } catch (error) {
            console.error('Error reverse geocoding:', error);
            onLocationSelect({ lat, lng, name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
          }
        });
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxAvailable, initialCenter, initialZoom, markers, onLocationSelect, onMarkerClick]);

  // Show loading state
  if (!mapboxAvailable) {
    return (
      <div 
        ref={mapContainer}
        className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center"
      >
        <div className="text-center text-white">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-lg font-semibold">Loading Map...</p>
          <p className="text-sm opacity-80">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .mapboxgl-marker-selected {
            transform: scale(1.8);
            filter: brightness(1.5) contrast(1.3) drop-shadow(0 0 8px rgba(59, 130, 246, 0.8)) drop-shadow(0 0 16px rgba(59, 130, 246, 0.4));
            z-index: 1000;
            border: 3px solid rgba(59, 130, 246, 0.8);
            border-radius: 50%;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
          }
        `}
      </style>
      
      {/* Moving indicator */}
      {isMoving && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="text-sm font-medium">Moving to event location...</span>
        </div>
      )}
      
      <div 
        ref={mapContainer}
        className="w-full h-full"
      />
    </>
  );
});

export default MapComponent;

// Add mapboxgl to window type
declare global {
  interface Window {
    mapboxgl: any;
  }
} 