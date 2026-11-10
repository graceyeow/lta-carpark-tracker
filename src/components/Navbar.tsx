import React from 'react';
import { 
  Compass, 
  MapPin, 
  Calculator, 
  Bookmark, 
  Code2, 
  RefreshCw, 
  Sun, 
  Moon,
  Car
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'explore' | 'nearby' | 'calculator' | 'saved';
  setActiveTab: (tab: 'explore' | 'nearby' | 'calculator' | 'saved') => void;
  onOpenBackendGuide: () => void;
  onRefreshLots: () => void;
  isRefreshing: boolean;
  lastUpdatedText: string;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  favoritesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenBackendGuide,
  onRefreshLots,
  isRefreshing,
  lastUpdatedText,
  isDarkMode,
  setIsDarkMode,
  favoritesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 dark:bg-slate-900/95 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setActiveTab('explore')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:bg-emerald-700 transition-colors">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                ParkSG
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                Singapore Live Carpark Tracker
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'explore'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            Explore & Map
          </button>

          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'nearby'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Find Nearby
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'calculator'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Fee Calculator
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'saved'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Saved Lots
            {favoritesCount > 0 && (
              <span className="text-xs font-mono px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenBackendGuide}
            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0"
          >
            <Code2 className="w-3.5 h-3.5 text-slate-400" />
            Backend Setup
          </button>
        </nav>

        {/* Zone 3: Primary Action & Utilities */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-[11px] text-slate-600 dark:text-slate-300">Live Status</span>
            <span className="text-xs font-mono tabular-nums text-slate-700 dark:text-slate-300">
              {lastUpdatedText}
            </span>
          </div>

          <button
            onClick={onRefreshLots}
            disabled={isRefreshing}
            title="Refresh Real-Time Lots Availability"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 disabled:opacity-70 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Lots</span>
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden items-center justify-around px-2 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-xs">
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded ${
            activeTab === 'explore'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Explore
        </button>
        <button
          onClick={() => setActiveTab('nearby')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded ${
            activeTab === 'nearby'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          Nearby
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded ${
            activeTab === 'calculator'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          Rates
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded ${
            activeTab === 'saved'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          Saved ({favoritesCount})
        </button>
      </div>
    </header>
  );
};
