export type VehicleType = 'car' | 'motorcycle' | 'heavyVehicle';

export type CarparkAgency = 'HDB' | 'URA' | 'LTA' | 'Commercial';

export type CarparkType = 
  | 'Multi-Storey Carpark (MSCP)' 
  | 'Surface Carpark' 
  | 'Basement Carpark' 
  | 'Mechanised Carpark';

export type SingaporeTown = 
  | 'Central / CBD'
  | 'Orchard / Somerset'
  | 'Marina Bay'
  | 'Bugis / Bras Basah'
  | 'Jurong East'
  | 'Tampines'
  | 'Ang Mo Kio'
  | 'Woodlands'
  | 'Bedok'
  | 'HarbourFront / Sentosa'
  | 'Changi / East Coast'
  | 'Bishan / Toa Payoh';

export interface LotInfo {
  total: number;
  available: number;
}

export interface CarparkRates {
  weekdayPerHalfHour: number; // in SGD
  peakWeekdayPerHalfHour?: number;
  weekendPerHalfHour: number;
  gracePeriodMinutes: number;
  nightParkingCap?: number; // e.g., 5.00 for HDB night parking (10:30pm to 7:00am)
  description: string;
}

export interface EVChargerInfo {
  hasEVCharging: boolean;
  totalChargers?: number;
  availableChargers?: number;
  provider?: 'SP Mobility' | 'Shell Recharge' | 'CDG ENGIE' | 'Charge+' | 'Tesla Supercharger';
  powerKw?: number;
}

export interface Carpark {
  id: string; // Carpark code, e.g. "ACB", "B28", "ORC01", "C18"
  name: string;
  address: string;
  postalCode: string;
  agency: CarparkAgency;
  type: CarparkType;
  parkingSystem: 'Electronic Parking System (EPS)' | 'Coupon Parking';
  shortTermParking: 'Whole Day' | '7am to 10:30pm' | 'No';
  freeParkingScheme: 'Sundays & PH 7am-10:30pm' | '12pm-2pm Weekdays' | 'None';
  nightParking: boolean;
  gantryHeightLimitMeters: number;
  evInfo: EVChargerInfo;
  location: {
    lat: number;
    lng: number;
  };
  town: SingaporeTown;
  lots: {
    car: LotInfo;
    motorcycle?: LotInfo;
    heavyVehicle?: LotInfo;
  };
  rates: CarparkRates;
  lastUpdated: string;
  occupancyHistory: number[]; // 12 historical points representing % occupancy (0-100)
  distanceKm?: number;
}

export interface FilterState {
  searchQuery: string;
  vehicleType: VehicleType;
  selectedTown: string;
  agency: string;
  availabilityStatus: 'all' | 'ample' | 'available' | 'full';
  onlyEVCharging: boolean;
  onlySheltered: boolean;
  onlyFreeParking: boolean;
  minClearance: number;
  sortBy: 'availableLots' | 'distance' | 'cheapest' | 'name';
}
