import React, { useState } from 'react';
import { X, Calculator, Clock, Car, Bike, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Carpark, VehicleType } from '../types/carpark';
import { CarparkService } from '../services/carparkService';

interface FeeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  carparks: Carpark[];
  initialCarpark?: Carpark | null;
  defaultVehicleType: VehicleType;
}

export const FeeCalculatorModal: React.FC<FeeCalculatorModalProps> = ({
  isOpen,
  onClose,
  carparks,
  initialCarpark,
  defaultVehicleType,
}) => {
  if (!isOpen) return null;

  const [selectedId, setSelectedId] = useState<string>(initialCarpark?.id || carparks[0]?.id || '');
  const [vehicleType, setVehicleType] = useState<VehicleType>(defaultVehicleType);

  // Default times: today now, exit 2 hours later
  const now = new Date();
  const formatDateTimeInput = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const [entryString, setEntryString] = useState<string>(formatDateTimeInput(now));
  const [exitString, setExitString] = useState<string>(formatDateTimeInput(twoHoursLater));

  const currentCarpark = carparks.find((c) => c.id === selectedId) || carparks[0];

  const entryDate = new Date(entryString);
  const exitDate = new Date(exitString);

  const feeResult = currentCarpark 
    ? CarparkService.calculateFee(currentCarpark, entryDate, exitDate, vehicleType)
    : { totalMinutes: 0, chargeableMinutes: 0, isGracePeriodExceeded: false, estimatedCost: 0, breakdownNote: '' };

  const hours = Math.floor(feeResult.totalMinutes / 60);
  const mins = feeResult.totalMinutes % 60;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Singapore Parking Fee Estimator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculates EPS rates, grace period & night parking schemes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Carpark Picker */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Select Carpark
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {carparks.map((cp) => (
                <option key={cp.id} value={cp.id}>
                  {cp.name} ({cp.id}) - {cp.town} [${cp.rates.weekdayPerHalfHour.toFixed(2)}/30m]
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Type Picker */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Vehicle Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setVehicleType('car')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border font-medium cursor-pointer transition-colors ${
                  vehicleType === 'car'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>Car</span>
              </button>
              <button
                type="button"
                onClick={() => setVehicleType('motorcycle')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border font-medium cursor-pointer transition-colors ${
                  vehicleType === 'motorcycle'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>Motorcycle</span>
              </button>
              <button
                type="button"
                onClick={() => setVehicleType('heavyVehicle')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border font-medium cursor-pointer transition-colors ${
                  vehicleType === 'heavyVehicle'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Heavy Vehicle</span>
              </button>
            </div>
          </div>

          {/* Time Picker Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Entry Time
              </label>
              <input
                type="datetime-local"
                value={entryString}
                onChange={(e) => setEntryString(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Exit Time
              </label>
              <input
                type="datetime-local"
                value={exitString}
                onChange={(e) => setExitString(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Quick Duration Buttons */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-400 font-medium">Quick duration:</span>
            {[30, 60, 120, 240].map((minsToAdd) => (
              <button
                key={minsToAdd}
                type="button"
                onClick={() => {
                  const newEntry = new Date(entryString);
                  const newExit = new Date(newEntry.getTime() + minsToAdd * 60 * 1000);
                  setExitString(formatDateTimeInput(newExit));
                }}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {minsToAdd >= 60 ? `${minsToAdd / 60}h` : `${minsToAdd}m`}
              </button>
            ))}
          </div>

          {/* Result Box */}
          <div className="p-4 rounded-xl bg-slate-900 text-white dark:bg-slate-800/90 border border-slate-800 mt-2 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Estimated Total Fee</span>
                <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-0.5">
                  ${feeResult.estimatedCost.toFixed(2)} SGD
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Duration</span>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {hours > 0 ? `${hours} hr ` : ''}{mins} mins
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{feeResult.breakdownNote}</span>
            </div>
          </div>

          {/* Rate Notice */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Fees include prevailing GST and account for EPS per-minute/per-block charging rules.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
