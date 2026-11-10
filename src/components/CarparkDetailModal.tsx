import React from 'react';
import { 
  X, 
  Car, 
  Bike, 
  Truck, 
  Zap, 
  Clock, 
  MapPin, 
  Navigation, 
  Calculator, 
  Bookmark, 
  ShieldCheck, 
  ExternalLink,
  Calendar,
  AlertTriangle,
  Building
} from 'lucide-react';
import { Carpark, VehicleType } from '../types/carpark';

interface CarparkDetailModalProps {
  carpark: Carpark | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenCalculator: (carpark: Carpark) => void;
  selectedVehicleType: VehicleType;
}

export const CarparkDetailModal: React.FC<CarparkDetailModalProps> = ({
  carpark,
  onClose,
  isFavorite,
  onToggleFavorite,
  onOpenCalculator,
}) => {
  if (!carpark) return null;

  const carAvail = carpark.lots.car.available;
  const carTotal = carpark.lots.car.total;
  const carOccupancyPct = Math.round(((carTotal - carAvail) / carTotal) * 100);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(carpark.name + ' ' + carpark.postalCode)}`;
  const wazeUrl = `https://waze.com/ul?ll=${carpark.location.lat},${carpark.location.lng}&navigate=yes`;

  // Hours for 12-hour occupancy trend: 8am to 8pm
  const trendHours = ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mb-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200">{carpark.agency}</span>
              <span>·</span>
              <span className="font-mono">{carpark.id}</span>
              <span>·</span>
              <span>{carpark.type}</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {carpark.name}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{carpark.address}</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onToggleFavorite(carpark.id)}
              className="p-2 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isFavorite ? 'Remove Favorite' : 'Save Carpark'}
            >
              <Bookmark className={`w-5 h-5 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Real-time Lot Breakdown Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              Real-Time Lots Breakdown
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Car Lots */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Car className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Cars</span>
                  </div>
                  <span className="font-mono text-[11px]">{carOccupancyPct}% full</span>
                </div>
                <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  {carAvail}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Available of <span className="font-mono">{carTotal}</span>
                </div>
              </div>

              {/* Motorcycle Lots */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Bike className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Motorcycles</span>
                  </div>
                </div>
                <div className="text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
                  {carpark.lots.motorcycle ? carpark.lots.motorcycle.available : 'N/A'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Available of <span className="font-mono">{carpark.lots.motorcycle?.total || 0}</span>
                </div>
              </div>

              {/* Heavy Vehicle Lots */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Truck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Heavy Vehicles</span>
                  </div>
                </div>
                <div className="text-2xl font-extrabold font-mono text-purple-600 dark:text-purple-400">
                  {carpark.lots.heavyVehicle ? carpark.lots.heavyVehicle.available : 'None'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Available of <span className="font-mono">{carpark.lots.heavyVehicle?.total || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Historical / Expected Occupancy Trend Chart */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                12-Hour Occupancy Pattern (Typical Day)
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400">Peak hours: 12PM - 2PM, 6PM - 8PM</span>
            </div>
            <div className="h-28 flex items-end justify-between gap-1.5 pt-4">
              {carpark.occupancyHistory.map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-7 text-[10px] font-mono bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-1 py-0.5 rounded shadow pointer-events-none transition-opacity">
                    {val}%
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-sm h-20 flex items-end">
                    <div
                      className={`w-full rounded-t-sm transition-all ${
                        val > 85 ? 'bg-rose-500' : val > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ height: `${val}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">{trendHours[idx]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Parking Rates & Gantry Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Rates */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Parking Fee Structure</span>
              </div>
              <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <li className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Weekday standard:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    ${carpark.rates.weekdayPerHalfHour.toFixed(2)} / 30 mins
                  </span>
                </li>
                {carpark.rates.peakWeekdayPerHalfHour && (
                  <li className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Peak weekday rate:</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                      ${carpark.rates.peakWeekdayPerHalfHour.toFixed(2)} / 30 mins
                    </span>
                  </li>
                )}
                <li className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Weekend rate:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    ${carpark.rates.weekendPerHalfHour.toFixed(2)} / 30 mins
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Grace period:</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {carpark.rates.gracePeriodMinutes} minutes free
                  </span>
                </li>
                {carpark.rates.nightParkingCap && (
                  <li className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Night parking cap:</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                      Max ${carpark.rates.nightParkingCap.toFixed(2)}
                    </span>
                  </li>
                )}
              </ul>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                {carpark.rates.description}
              </div>
            </div>

            {/* Gantry & Technical Specs */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Gantry & Vehicle Specs</span>
              </div>
              <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <li className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Gantry clearance:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    {carpark.gantryHeightLimitMeters}m
                    {carpark.gantryHeightLimitMeters < 2.0 && (
                      <span title="Low ceiling clearance warning">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      </span>
                    )}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Payment system:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {carpark.parkingSystem}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Free parking:</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {carpark.freeParkingScheme}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Short-term parking:</span>
                  <span className="text-slate-900 dark:text-white">
                    {carpark.shortTermParking}
                  </span>
                </li>
              </ul>

              {/* EV Charging Info */}
              {carpark.evInfo.hasEVCharging ? (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                    <Zap className="w-4 h-4" />
                    <span>{carpark.evInfo.provider}</span>
                  </div>
                  <span className="font-mono text-slate-600 dark:text-slate-300">
                    {carpark.evInfo.availableChargers} / {carpark.evInfo.totalChargers} ready ({carpark.evInfo.powerKw}kW)
                  </span>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                  No public EV charging stations on site.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              Google Maps
            </a>
            <a
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Waze
            </a>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenCalculator(carpark);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            Calculate Parking Fee
          </button>
        </div>
      </div>
    </div>
  );
};
