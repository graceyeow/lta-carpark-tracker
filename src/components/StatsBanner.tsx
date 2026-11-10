import React from 'react';
import { Car, Zap, Clock, ShieldCheck, Activity } from 'lucide-react';
import { Carpark } from '../types/carpark';

interface StatsBannerProps {
  carparks: Carpark[];
  liveApiSource: string;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ carparks, liveApiSource }) => {
  const totalCarLots = carparks.reduce((acc, c) => acc + c.lots.car.total, 0);
  const totalAvailCarLots = carparks.reduce((acc, c) => acc + c.lots.car.available, 0);
  const totalEVChargers = carparks.reduce((acc, c) => acc + (c.evInfo.availableChargers || 0), 0);
  const freeParkingCount = carparks.filter((c) => c.freeParkingScheme !== 'None').length;
  const overallOccupancyPct = totalCarLots > 0 ? Math.round(((totalCarLots - totalAvailCarLots) / totalCarLots) * 100) : 0;

  return (
    <section className="bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
          {/* Stat 1 */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Available Car Lots</div>
              <div className="text-xl font-bold font-mono tabular-nums text-emerald-400">
                {totalAvailCarLots.toLocaleString()}
                <span className="text-xs font-normal text-slate-400 ml-1">/ {totalCarLots.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="flex items-center gap-3 pt-2 md:pt-0 md:pl-4">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Island Occupancy</div>
              <div className="text-xl font-bold font-mono tabular-nums text-white">
                {overallOccupancyPct}%
                <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">Avg Capacity</span>
              </div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="flex items-center gap-3 pt-2 md:pt-0 md:pl-4">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">EV Chargers</div>
              <div className="text-xl font-bold font-mono tabular-nums text-amber-300">
                {totalEVChargers}
                <span className="text-xs font-normal text-slate-400 ml-1 font-sans">Ready to charge</span>
              </div>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="flex items-center gap-3 pt-2 md:pt-0 md:pl-4">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Free Parking Sites</div>
              <div className="text-xl font-bold font-mono tabular-nums text-purple-300">
                {freeParkingCount}
                <span className="text-xs font-normal text-slate-400 ml-1 font-sans">HDB / URA sites</span>
              </div>
            </div>
          </div>

          {/* Stat 5 */}
          <div className="col-span-2 md:col-span-1 flex items-center gap-3 pt-2 md:pt-0 md:pl-4">
            <div className="p-2 rounded-lg bg-slate-800 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Feed Source</div>
              <div className="text-xs font-semibold text-slate-200 truncate">
                {liveApiSource}
              </div>
              <div className="text-[10px] text-slate-400">LTA / HDB / URA EPS</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
