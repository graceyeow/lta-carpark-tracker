import React from 'react';
import { 
  Bookmark, 
  MapPin, 
  Zap, 
  Clock, 
  Navigation, 
  Calculator, 
  Info,
  ShieldAlert
} from 'lucide-react';
import { Carpark, VehicleType } from '../types/carpark';

interface CarparkCardProps {
  carpark: Carpark;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onOpenDetails: () => void;
  onOpenCalculator: () => void;
  vehicleType: VehicleType;
}

export const CarparkCard: React.FC<CarparkCardProps> = ({
  carpark,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onOpenDetails,
  onOpenCalculator,
  vehicleType,
}) => {
  const lotInfo = 
    vehicleType === 'motorcycle'
      ? carpark.lots.motorcycle || { available: 0, total: 0 }
      : vehicleType === 'heavyVehicle'
      ? carpark.lots.heavyVehicle || { available: 0, total: 0 }
      : carpark.lots.car;

  const total = lotInfo.total;
  const avail = lotInfo.available;
  const occupancyPct = total > 0 ? Math.round(((total - avail) / total) * 100) : 0;

  // Semantic color for lot availability
  let statusText = 'Ample Lots';
  let statusColor = 'text-emerald-600 dark:text-emerald-400';
  let barColor = 'bg-emerald-500';
  if (avail === 0) {
    statusText = 'Full / No Lots';
    statusColor = 'text-rose-600 dark:text-rose-400';
    barColor = 'bg-rose-500';
  } else if (avail < 25) {
    statusText = 'Limited Lots';
    statusColor = 'text-amber-600 dark:text-amber-400';
    barColor = 'bg-amber-500';
  } else if (avail < 60) {
    statusText = 'Moderate';
    statusColor = 'text-blue-600 dark:text-blue-400';
    barColor = 'bg-blue-500';
  }

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${carpark.location.lat},${carpark.location.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <article
      onClick={onSelect}
      className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 dark:border-emerald-500 shadow-sm'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
      }`}
    >
      {/* Top Metadata: Clean unboxed text with typographic separators */}
      <div className="flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300 mb-1.5">
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-semibold text-slate-800 dark:text-slate-200">{carpark.agency}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">{carpark.id}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{carpark.town}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          title={isFavorite ? 'Remove from Saved' : 'Save to Favorites'}
          className={`p-1 rounded-md transition-colors ${
            isFavorite
              ? 'text-amber-500 hover:text-amber-600'
              : 'text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-300'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
        </button>
      </div>

      {/* Main Title */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
            {carpark.name}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5">
            {carpark.address}
          </p>
        </div>

        {/* Big Lot Availability Number */}
        <div className="text-right shrink-0">
          <div className="text-2xl font-extrabold font-mono tabular-nums leading-none text-slate-900 dark:text-white">
            {avail}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
            of <span className="font-mono">{total}</span> lots
          </div>
        </div>
      </div>

      {/* Occupancy Bar */}
      <div className="space-y-1 mb-3">
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.min(100, occupancyPct)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className={`font-semibold ${statusColor}`}>{statusText}</span>
          <span className="font-mono text-slate-600 dark:text-slate-300">{occupancyPct}% full</span>
        </div>
      </div>

      {/* Features & Rates Line */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300 py-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            ${carpark.rates.weekdayPerHalfHour.toFixed(2)}
          </span>
          <span>/ 30m</span>
        </div>
        
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
        
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{carpark.rates.gracePeriodMinutes}m grace</span>
        </div>

        {carpark.evInfo.hasEVCharging && (
          <>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <div className="flex items-center gap-1 text-amber-700 dark:text-amber-300 font-medium">
              <Zap className="w-3.5 h-3.5" />
              <span>{carpark.evInfo.availableChargers || 2} EV</span>
            </div>
          </>
        )}

        {carpark.distanceKm !== undefined && (
          <>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <div className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span>{carpark.distanceKm} km</span>
            </div>
          </>
        )}
      </div>

      {/* Actions Strip */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenCalculator();
          }}
          className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1 cursor-pointer"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Fee Calc</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDirections}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-1 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Directions</span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails();
            }}
            className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors py-1 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>
        </div>
      </div>
    </article>
  );
};
