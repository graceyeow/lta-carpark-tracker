import React from 'react';
import { Carpark, VehicleType } from '../types/carpark';
import { CarparkCard } from './CarparkCard';
import { SearchX, Filter } from 'lucide-react';

interface CarparkListProps {
  carparks: Carpark[];
  selectedCarpark: Carpark | null;
  favorites: string[];
  onSelectCarpark: (carpark: Carpark) => void;
  onToggleFavorite: (id: string) => void;
  onOpenDetails: (carpark: Carpark) => void;
  onOpenCalculator: (carpark: Carpark) => void;
  onResetFilters: () => void;
  vehicleType: VehicleType;
}

export const CarparkList: React.FC<CarparkListProps> = ({
  carparks,
  selectedCarpark,
  favorites,
  onSelectCarpark,
  onToggleFavorite,
  onOpenDetails,
  onOpenCalculator,
  onResetFilters,
  vehicleType,
}) => {
  if (carparks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[350px]">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          No carparks found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
          No carparks match your current search keywords or filter combinations.
        </p>
        <button
          onClick={onResetFilters}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3 sm:p-4 overflow-y-auto h-full">
      {carparks.map((cp) => (
        <CarparkCard
          key={cp.id}
          carpark={cp}
          isSelected={selectedCarpark?.id === cp.id}
          isFavorite={favorites.includes(cp.id)}
          onSelect={() => onSelectCarpark(cp)}
          onToggleFavorite={() => onToggleFavorite(cp.id)}
          onOpenDetails={() => onOpenDetails(cp)}
          onOpenCalculator={() => onOpenCalculator(cp)}
          vehicleType={vehicleType}
        />
      ))}
    </div>
  );
};
