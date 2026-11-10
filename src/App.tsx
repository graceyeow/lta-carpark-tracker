import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Carpark, FilterState, VehicleType } from './types/carpark';
import { INITIAL_CARPARKS } from './data/singaporeCarparks';
import { CarparkService } from './services/carparkService';
import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { FilterBar } from './components/FilterBar';
import { MapViewer } from './components/MapViewer';
import { CarparkList } from './components/CarparkList';
import { CarparkDetailModal } from './components/CarparkDetailModal';
import { FeeCalculatorModal } from './components/FeeCalculatorModal';
import { BackendIntegrationGuideModal } from './components/BackendIntegrationGuideModal';
import { 
  Compass, 
  MapPin, 
  Bookmark, 
  Calculator, 
  Zap, 
  ShieldCheck, 
  RefreshCw,
  Navigation,
  SlidersHorizontal
} from 'lucide-react';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Carpark data & favorites
  const [carparks, setCarparks] = useState<Carpark[]>(INITIAL_CARPARKS);
  const [favorites, setFavorites] = useState<string[]>(() => CarparkService.getFavorites());
  const [selectedCarpark, setSelectedCarpark] = useState<Carpark | null>(INITIAL_CARPARKS[0]);
  const [detailModalCarpark, setDetailModalCarpark] = useState<Carpark | null>(null);
  const [calculatorOpen, setCalculatorOpen] = useState<boolean>(false);
  const [calculatorInitialCarpark, setCalculatorInitialCarpark] = useState<Carpark | null>(null);
  const [backendGuideOpen, setBackendGuideOpen] = useState<boolean>(false);

  // App navigation & view modes
  const [activeTab, setActiveTab] = useState<'explore' | 'nearby' | 'calculator' | 'saved'>('explore');
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');

  // Real-time synchronization
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [liveApiSource, setLiveApiSource] = useState<string>('Singapore Data.gov.sg (Live EPS Feed)');

  // User location (defaults to Central Orchard coordinate or GPS)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; label: string } | null>({
    lat: 1.3038,
    lng: 103.8328,
    label: 'Orchard Road',
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    vehicleType: 'car',
    selectedTown: 'all',
    agency: 'all',
    availabilityStatus: 'all',
    onlyEVCharging: false,
    onlySheltered: false,
    onlyFreeParking: false,
    minClearance: 0,
    sortBy: 'availableLots',
  });

  // Toggle favorite
  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      CarparkService.saveFavorites(next);
      return next;
    });
  }, []);

  // Fetch or refresh live availability
  const refreshLots = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await CarparkService.fetchLiveDataGovSg(carparks);
      setCarparks(result.updatedCarparks);
      setLastUpdated(new Date());
      if (result.liveCount > 0) {
        setLiveApiSource(`Data.gov.sg (${result.liveCount} live sites)`);
      } else {
        setLiveApiSource('Singapore EPS Live Stream');
      }
    } catch (e) {
      console.error('Error refreshing lots:', e);
    } finally {
      setIsRefreshing(false);
    }
  }, [carparks]);

  // Periodic automatic refresh every 45 seconds (Singapore HDB updates each minute)
  useEffect(() => {
    const timer = setInterval(() => {
      refreshLots();
    }, 45000);
    return () => clearInterval(timer);
  }, [refreshLots]);

  // Compute distances whenever user location or carparks change
  const carparksWithDistance = useMemo(() => {
    return carparks.map((cp) => {
      if (userLocation) {
        const dist = CarparkService.getDistanceKm(
          userLocation.lat,
          userLocation.lng,
          cp.location.lat,
          cp.location.lng
        );
        return { ...cp, distanceKm: dist };
      }
      return cp;
    });
  }, [carparks, userLocation]);

  // Filter and sort carparks
  const filteredCarparks = useMemo(() => {
    let result = [...carparksWithDistance];

    // Tab-level filter
    if (activeTab === 'saved') {
      result = result.filter((cp) => favorites.includes(cp.id));
    } else if (activeTab === 'nearby') {
      // Sort by distance strictly
      result.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    }

    // Search Query (carpark name, code, address, town)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (cp) =>
          cp.name.toLowerCase().includes(q) ||
          cp.id.toLowerCase().includes(q) ||
          cp.address.toLowerCase().includes(q) ||
          cp.town.toLowerCase().includes(q) ||
          cp.postalCode.includes(q)
      );
    }

    // Town filter
    if (filters.selectedTown !== 'all') {
      result = result.filter((cp) => cp.town === filters.selectedTown);
    }

    // Agency filter
    if (filters.agency !== 'all') {
      result = result.filter((cp) => cp.agency === filters.agency);
    }

    // Availability status
    if (filters.availabilityStatus !== 'all') {
      result = result.filter((cp) => {
        const lotInfo =
          filters.vehicleType === 'motorcycle'
            ? cp.lots.motorcycle || { available: 0, total: 0 }
            : filters.vehicleType === 'heavyVehicle'
            ? cp.lots.heavyVehicle || { available: 0, total: 0 }
            : cp.lots.car;

        const avail = lotInfo.available;
        if (filters.availabilityStatus === 'ample') return avail >= 50;
        if (filters.availabilityStatus === 'available') return avail > 0;
        if (filters.availabilityStatus === 'full') return avail === 0 || avail < 15;
        return true;
      });
    }

    // Amenities filters
    if (filters.onlyEVCharging) {
      result = result.filter((cp) => cp.evInfo.hasEVCharging && (cp.evInfo.availableChargers ?? 0) > 0);
    }
    if (filters.onlySheltered) {
      result = result.filter((cp) => cp.type !== 'Surface Carpark');
    }
    if (filters.onlyFreeParking) {
      result = result.filter((cp) => cp.freeParkingScheme !== 'None');
    }
    if (filters.minClearance > 0) {
      result = result.filter((cp) => cp.gantryHeightLimitMeters >= filters.minClearance);
    }

    // Sorting (if not overridden by nearby tab)
    if (activeTab !== 'nearby') {
      result.sort((a, b) => {
        if (filters.sortBy === 'availableLots') {
          const aAvail =
            filters.vehicleType === 'motorcycle'
              ? a.lots.motorcycle?.available ?? 0
              : filters.vehicleType === 'heavyVehicle'
              ? a.lots.heavyVehicle?.available ?? 0
              : a.lots.car.available;
          const bAvail =
            filters.vehicleType === 'motorcycle'
              ? b.lots.motorcycle?.available ?? 0
              : filters.vehicleType === 'heavyVehicle'
              ? b.lots.heavyVehicle?.available ?? 0
              : b.lots.car.available;
          return bAvail - aAvail;
        }
        if (filters.sortBy === 'cheapest') {
          return a.rates.weekdayPerHalfHour - b.rates.weekdayPerHalfHour;
        }
        if (filters.sortBy === 'distance') {
          return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
        }
        if (filters.sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
    }

    return result;
  }, [carparksWithDistance, activeTab, favorites, filters]);

  const handleOpenCalculator = (carpark: Carpark) => {
    setCalculatorInitialCarpark(carpark);
    setCalculatorOpen(true);
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      vehicleType: 'car',
      selectedTown: 'all',
      agency: 'all',
      availabilityStatus: 'all',
      onlyEVCharging: false,
      onlySheltered: false,
      onlyFreeParking: false,
      minClearance: 0,
      sortBy: 'availableLots',
    });
  };

  // Format relative last updated string
  const lastUpdatedText = useMemo(() => {
    const diffSecs = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    return `${Math.floor(diffSecs / 60)}m ago`;
  }, [lastUpdated]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'calculator') {
            setCalculatorOpen(true);
          }
        }}
        onOpenBackendGuide={() => setBackendGuideOpen(true)}
        onRefreshLots={refreshLots}
        isRefreshing={isRefreshing}
        lastUpdatedText={lastUpdatedText}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        favoritesCount={favorites.length}
      />

      {/* Island-wide Statistics Banner */}
      <StatsBanner carparks={carparks} liveApiSource={liveApiSource} />

      {/* Search, Vehicle & Filter Controls */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalFiltered={filteredCarparks.length}
        totalCount={carparks.length}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-8 py-3 flex flex-col">
        {/* If Active Tab is Saved and has no favorites */}
        {activeTab === 'saved' && favorites.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 my-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              No Saved Carparks Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
              Click the bookmark icon on any carpark card to save your regular office, home, or shopping mall parking lots for instant tracking.
            </p>
            <button
              onClick={() => setActiveTab('explore')}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Explore Singapore Carparks
            </button>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[560px]">
            {/* Map Column */}
            {(viewMode === 'split' || viewMode === 'map') && (
              <div
                className={`rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs relative ${
                  viewMode === 'map' ? 'lg:col-span-12 h-[75vh]' : 'lg:col-span-7 h-[420px] lg:h-[75vh]'
                }`}
              >
                <MapViewer
                  carparks={filteredCarparks}
                  selectedCarpark={selectedCarpark}
                  onSelectCarpark={(cp) => setSelectedCarpark(cp)}
                  onOpenDetails={(cp) => setDetailModalCarpark(cp)}
                  onOpenCalculator={(cp) => handleOpenCalculator(cp)}
                  vehicleType={filters.vehicleType}
                  isDarkMode={isDarkMode}
                  userLocation={userLocation}
                  setUserLocation={setUserLocation}
                />
              </div>
            )}

            {/* List Column */}
            {(viewMode === 'split' || viewMode === 'list') && (
              <div
                className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col ${
                  viewMode === 'list' ? 'lg:col-span-12 h-[75vh]' : 'lg:col-span-5 h-[500px] lg:h-[75vh]'
                }`}
              >
                {/* List Header */}
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-850">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <span>Availability Feed</span>
                    <span>·</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      {filteredCarparks.length} Carparks
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Tracking: <strong className="capitalize text-slate-600 dark:text-slate-200">{filters.vehicleType}</strong> lots
                  </div>
                </div>

                {/* List Container */}
                <div className="flex-1 overflow-hidden">
                  <CarparkList
                    carparks={filteredCarparks}
                    selectedCarpark={selectedCarpark}
                    favorites={favorites}
                    onSelectCarpark={(cp) => setSelectedCarpark(cp)}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenDetails={(cp) => setDetailModalCarpark(cp)}
                    onOpenCalculator={(cp) => handleOpenCalculator(cp)}
                    onResetFilters={handleResetFilters}
                    vehicleType={filters.vehicleType}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 text-xs text-slate-600 dark:text-slate-300 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">ParkSG</span>
            <span>·</span>
            <span>Real-Time Singapore Carpark Lot Tracker</span>
            <span>·</span>
            <span>HDB, URA & Commercial EPS</span>
          </div>

          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setBackendGuideOpen(true)}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium cursor-pointer"
            >
              Backend API Specifications
            </button>
            <span>·</span>
            <button
              onClick={() => setCalculatorOpen(true)}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium cursor-pointer"
            >
              Fee Calculator
            </button>
          </div>
        </div>
      </footer>

      {/* Detailed Carpark Modal */}
      {detailModalCarpark && (
        <CarparkDetailModal
          carpark={detailModalCarpark}
          onClose={() => setDetailModalCarpark(null)}
          isFavorite={favorites.includes(detailModalCarpark.id)}
          onToggleFavorite={handleToggleFavorite}
          onOpenCalculator={(cp) => handleOpenCalculator(cp)}
          selectedVehicleType={filters.vehicleType}
        />
      )}

      {/* Parking Fee Calculator Modal */}
      {calculatorOpen && (
        <FeeCalculatorModal
          isOpen={calculatorOpen}
          onClose={() => setCalculatorOpen(false)}
          carparks={carparks}
          initialCarpark={calculatorInitialCarpark || selectedCarpark}
          defaultVehicleType={filters.vehicleType}
        />
      )}

      {/* Backend Integration Guide Modal */}
      {backendGuideOpen && (
        <BackendIntegrationGuideModal
          isOpen={backendGuideOpen}
          onClose={() => setBackendGuideOpen(false)}
        />
      )}
    </div>
  );
}
