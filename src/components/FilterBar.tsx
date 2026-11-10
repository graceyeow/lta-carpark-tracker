import React from 'react';
import { 
  Search, 
  X, 
  Car, 
  Bike, 
  Truck, 
  Zap, 
  Umbrella, 
  Gift, 
  ArrowUpDown, 
  Map, 
  List, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { FilterState, VehicleType, SingaporeTown } from '../types/carpark';

const TOWNS: SingaporeTown[] = [
  'Central / CBD',
  'Orchard / Somerset',
  'Marina Bay',
  'Bugis / Bras Basah',
  'Jurong East',
  'Tampines',
  'Ang Mo Kio',
  'Woodlands',
  'Bedok',
  'HarbourFront / Sentosa',
  'Changi / East Coast',
  'Bishan / Toa Payoh',
];

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  viewMode: 'split' | 'map' | 'list';
  setViewMode: (mode: 'split' | 'map' | 'list') => void;
  totalFiltered: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  viewMode,
  setViewMode,
  totalFiltered,
  totalCount,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const handleVehicleChange = (vt: VehicleType) => {
    setFilters((prev) => ({ ...prev, vehicleType: vt }));
  };

  const handleClearSearch = () => {
    setFilters((prev) => ({ ...prev, searchQuery: '' }));
  };

  const activeFiltersCount = 
    (filters.selectedTown !== 'all' ? 1 : 0) +
    (filters.availabilityStatus !== 'all' ? 1 : 0) +
    (filters.onlyEVCharging ? 1 : 0) +
    (filters.onlySheltered ? 1 : 0) +
    (filters.onlyFreeParking ? 1 : 0) +
    (filters.minClearance > 0 ? 1 : 0) +
    (filters.agency !== 'all' ? 1 : 0);

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
        {/* Row 1: Search + Vehicle Selector + View Toggle */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search by Carpark code (ACB, SUN01), location, or address..."
              className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-600 dark:placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            />
            {filters.searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Vehicle Type Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
            <button
              onClick={() => handleVehicleChange('car')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filters.vehicleType === 'car'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              Car
            </button>
            <button
              onClick={() => handleVehicleChange('motorcycle')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filters.vehicleType === 'motorcycle'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              Motorcycle
            </button>
            <button
              onClick={() => handleVehicleChange('heavyVehicle')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filters.vehicleType === 'heavyVehicle'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              Heavy Vehicle
            </button>
          </div>

          {/* View Mode Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              Map Only
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List Only
            </button>
          </div>
        </div>

        {/* Row 2: Quick Filters & Sorters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Town Selector */}
            <div className="relative">
              <select
                value={filters.selectedTown}
                onChange={(e) => setFilters((prev) => ({ ...prev, selectedTown: e.target.value }))}
                className="appearance-none pl-3 pr-7 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="all">All Singapore Towns</option>
                {TOWNS.map((town) => (
                  <option key={town} value={town}>{town}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Availability Status */}
            <div className="relative">
              <select
                value={filters.availabilityStatus}
                onChange={(e) => setFilters((prev) => ({ ...prev, availabilityStatus: e.target.value as any }))}
                className="appearance-none pl-3 pr-7 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="all">Any Availability</option>
                <option value="ample">Ample Lots (&gt; 50 lots)</option>
                <option value="available">Available Only (&gt; 0)</option>
                <option value="full">Critical / Full Only</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Quick Toggle: EV Only */}
            <button
              onClick={() => setFilters((prev) => ({ ...prev, onlyEVCharging: !prev.onlyEVCharging }))}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filters.onlyEVCharging
                  ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-semibold'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              EV Chargers
            </button>

            {/* Quick Toggle: Free Parking Scheme */}
            <button
              onClick={() => setFilters((prev) => ({ ...prev, onlyFreeParking: !prev.onlyFreeParking }))}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filters.onlyFreeParking
                  ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 font-semibold'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              Free Parking Scheme
            </button>

            {/* Advanced Filters Button */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                showAdvanced || activeFiltersCount > 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              More Filters
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] ml-0.5 font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Sorter and Count */}
          <div className="flex items-center gap-3">
            <span className="text-slate-600 dark:text-slate-300 text-xs">
              Showing <strong className="text-slate-900 dark:text-white font-mono">{totalFiltered}</strong> of {totalCount}
            </span>

            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
                className="bg-transparent font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="availableLots">Most Lots Available</option>
                <option value="cheapest">Cheapest Rate</option>
                <option value="distance">Nearest Distance</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        {showAdvanced && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Agency Selector */}
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Agency / Operator</label>
              <select
                value={filters.agency}
                onChange={(e) => setFilters((prev) => ({ ...prev, agency: e.target.value }))}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">All Operators (HDB, URA, Commercial)</option>
                <option value="HDB">HDB (Housing & Development Board)</option>
                <option value="URA">URA (Urban Redevelopment Authority)</option>
                <option value="Commercial">Commercial (CapitaLand, Malls, MBFC)</option>
              </select>
            </div>

            {/* Sheltered / MSCP */}
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={filters.onlySheltered}
                  onChange={(e) => setFilters((prev) => ({ ...prev, onlySheltered: e.target.checked }))}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <Umbrella className="w-3.5 h-3.5 text-slate-400" />
                <span>Sheltered / MSCP / Basement only</span>
              </label>
            </div>

            {/* Clearance Requirement */}
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">
                Min. Gantry Clearance ({filters.minClearance > 0 ? `${filters.minClearance}m` : 'Any height'})
              </label>
              <input
                type="range"
                min="0"
                max="2.5"
                step="0.1"
                value={filters.minClearance}
                onChange={(e) => setFilters((prev) => ({ ...prev, minClearance: parseFloat(e.target.value) }))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
