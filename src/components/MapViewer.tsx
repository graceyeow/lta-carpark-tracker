import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Carpark, VehicleType } from '../types/carpark';
import { Crosshair, Layers, Navigation } from 'lucide-react';

interface MapViewerProps {
  carparks: Carpark[];
  selectedCarpark: Carpark | null;
  onSelectCarpark: (carpark: Carpark) => void;
  onOpenDetails: (carpark: Carpark) => void;
  onOpenCalculator: (carpark: Carpark) => void;
  vehicleType: VehicleType;
  isDarkMode: boolean;
  userLocation: { lat: number; lng: number; label: string } | null;
  setUserLocation: (loc: { lat: number; lng: number; label: string }) => void;
}

const PRESET_LOCATIONS = [
  { label: 'Raffles Place (CBD)', lat: 1.2830, lng: 103.8519 },
  { label: 'Orchard Road', lat: 1.3038, lng: 103.8328 },
  { label: 'Jurong Gateway', lat: 1.3331, lng: 103.7425 },
  { label: 'Tampines Central', lat: 1.3525, lng: 103.9447 },
  { label: 'Woodlands Square', lat: 1.4360, lng: 103.7860 },
];

export const MapViewer: React.FC<MapViewerProps> = ({
  carparks,
  selectedCarpark,
  onSelectCarpark,
  onOpenDetails,
  onOpenCalculator,
  vehicleType,
  isDarkMode,
  userLocation,
  setUserLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [1.3521, 103.8198], // Center of Singapore
      zoom: 12,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // CartoDB tiles provide clean, distraction-free typography for map navigation
    const lightTiles = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(isDarkMode ? darkTiles : lightTiles, {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isDarkMode]);

  // Update Markers when carparks, vehicleType, or selectedCarpark changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    carparks.forEach((cp) => {
      const lotInfo = 
        vehicleType === 'motorcycle' 
          ? cp.lots.motorcycle || { available: 0, total: 0 }
          : vehicleType === 'heavyVehicle'
          ? cp.lots.heavyVehicle || { available: 0, total: 0 }
          : cp.lots.car;

      const avail = lotInfo.available;
      const isSelected = selectedCarpark?.id === cp.id;

      // Color coding based on lot availability
      let bgClass = 'bg-emerald-600 text-white border-emerald-700';
      if (avail === 0) {
        bgClass = 'bg-rose-600 text-white border-rose-700';
      } else if (avail < 25) {
        bgClass = 'bg-amber-500 text-slate-900 border-amber-600 font-bold';
      }

      const ringClass = isSelected 
        ? 'ring-4 ring-offset-2 ring-emerald-500 scale-110 z-50' 
        : 'hover:scale-105';

      // Custom HTML Marker Pin
      const html = `
        <div class="transition-all transform cursor-pointer ${ringClass}">
          <div class="px-2 py-1 rounded-md text-[11px] font-mono tabular-nums font-semibold shadow-md flex items-center gap-1 border ${bgClass}">
            <span>${avail}</span>
            <span class="text-[9px] opacity-80 uppercase">${cp.id}</span>
          </div>
          <div class="w-1.5 h-1.5 bg-slate-900 dark:bg-white mx-auto mt-0.5 rounded-full shadow-xs"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-carpark-pin',
        html,
        iconSize: [64, 30],
        iconAnchor: [32, 30],
      });

      const marker = L.marker([cp.location.lat, cp.location.lng], { icon: customIcon });

      marker.on('click', () => {
        onSelectCarpark(cp);
      });

      markersGroup.addLayer(marker);
    });
  }, [carparks, selectedCarpark, vehicleType, onSelectCarpark]);

  // Center on selected carpark
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedCarpark) return;
    mapInstanceRef.current.flyTo(
      [selectedCarpark.location.lat, selectedCarpark.location.lng],
      15,
      { duration: 1.2 }
    );
  }, [selectedCarpark]);

  // Update user location pin
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const userHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-6 h-6 rounded-full bg-blue-500/20 animate-ping absolute"></div>
          <div class="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md relative z-10"></div>
        </div>
      `;
      const userIcon = L.divIcon({
        className: 'user-location-pin',
        html: userHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const uMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
      userMarkerRef.current = uMarker;
    }
  }, [userLocation]);

  const handleJumpToTown = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1 });
  };

  const handleGetBrowserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLoc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            label: 'My Current GPS',
          };
          setUserLocation(newLoc);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([newLoc.lat, newLoc.lng], 14);
          }
        },
        (err) => {
          console.warn('Geolocation failed or permission denied, using default preset:', err);
          const fallback = PRESET_LOCATIONS[0];
          setUserLocation(fallback);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([fallback.lat, fallback.lng], 14);
          }
        }
      );
    } else {
      const fallback = PRESET_LOCATIONS[0];
      setUserLocation(fallback);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] bg-slate-900 overflow-hidden flex flex-col">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Town Quick Jump Bar */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto z-10 flex items-center gap-1.5 overflow-x-auto p-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 pl-1.5 pr-1 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Navigation className="w-3 h-3 text-emerald-600" /> Town
        </span>
        <button
          onClick={() => handleJumpToTown(1.2830, 103.8519)}
          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 whitespace-nowrap cursor-pointer transition-colors"
        >
          CBD / Marina
        </button>
        <button
          onClick={() => handleJumpToTown(1.3038, 103.8328)}
          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 whitespace-nowrap cursor-pointer transition-colors"
        >
          Orchard
        </button>
        <button
          onClick={() => handleJumpToTown(1.3331, 103.7425)}
          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 whitespace-nowrap cursor-pointer transition-colors"
        >
          Jurong East
        </button>
        <button
          onClick={() => handleJumpToTown(1.3525, 103.9447)}
          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 whitespace-nowrap cursor-pointer transition-colors"
        >
          Tampines
        </button>
        <button
          onClick={() => handleJumpToTown(1.3705, 103.8471)}
          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 whitespace-nowrap cursor-pointer transition-colors"
        >
          Ang Mo Kio
        </button>
        <button
          onClick={() => handleJumpToTown(1.4360, 103.7860)}
          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 whitespace-nowrap cursor-pointer transition-colors"
        >
          Woodlands
        </button>
        <button
          onClick={() => handleJumpToTown(1.2644, 103.8222)}
          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 whitespace-nowrap cursor-pointer transition-colors"
        >
          VivoCity / Sentosa
        </button>
      </div>

      {/* Floating Action Controls on Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleGetBrowserLocation}
          title="Center on My Location"
          className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg shadow-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium cursor-pointer transition-colors"
        >
          <Crosshair className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>{userLocation ? userLocation.label : 'Locate Me'}</span>
        </button>

        {userLocation && (
          <div className="flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-2.5 py-1 rounded-md text-[11px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
            <span>Simulate at:</span>
            <select
              value={userLocation.label}
              onChange={(e) => {
                const target = PRESET_LOCATIONS.find((p) => p.label === e.target.value);
                if (target) {
                  setUserLocation(target);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([target.lat, target.lng], 14);
                  }
                }
              }}
              className="bg-transparent font-medium text-slate-900 dark:text-white cursor-pointer focus:outline-none"
            >
              {PRESET_LOCATIONS.map((loc) => (
                <option key={loc.label} value={loc.label}>{loc.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Selected Carpark Bottom Card Preview */}
      {selectedCarpark && (
        <div className="absolute bottom-4 right-4 max-w-sm w-full z-10 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-3.5 transition-all">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <span>{selectedCarpark.agency}</span>
                <span>·</span>
                <span>{selectedCarpark.id}</span>
                <span>·</span>
                <span>{selectedCarpark.town}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
                {selectedCarpark.name}
              </h4>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs text-slate-600 dark:text-slate-300">Available</div>
              <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {vehicleType === 'motorcycle'
                  ? selectedCarpark.lots.motorcycle?.available ?? 0
                  : vehicleType === 'heavyVehicle'
                  ? selectedCarpark.lots.heavyVehicle?.available ?? 0
                  : selectedCarpark.lots.car.available}
                <span className="text-xs font-normal text-slate-400 ml-1">
                  / {vehicleType === 'motorcycle'
                    ? selectedCarpark.lots.motorcycle?.total ?? 0
                    : vehicleType === 'heavyVehicle'
                    ? selectedCarpark.lots.heavyVehicle?.total ?? 0
                    : selectedCarpark.lots.car.total}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
            <div>Rate: ${selectedCarpark.rates.weekdayPerHalfHour.toFixed(2)} / 30m</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenCalculator(selectedCarpark)}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
              >
                Estimate Fee
              </button>
              <span>·</span>
              <button
                onClick={() => onOpenDetails(selectedCarpark)}
                className="font-semibold text-slate-900 dark:text-white hover:text-emerald-600 cursor-pointer"
              >
                Full Details →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
