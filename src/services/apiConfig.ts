/**
 * ParkSG Backend Connection Configuration
 * 
 * When you are ready to connect your backend:
 * 1. Set VITE_API_BASE_URL in your .env or production environment
 * 2. Set USE_BACKEND_API = true below
 * 
 * Expected Backend Endpoints:
 * - GET    /api/carparks                     => Returns Carpark[] array
 * - GET    /api/carparks/availability        => Returns live lot counts { [carparkId]: { carAvailable, ... } }
 * - GET    /api/carparks/:id                 => Returns single Carpark details
 * - POST   /api/carparks/calculate-rate      => Optional server-side rate calculation
 * - GET    /api/data-gov-sg/live             => Proxy for Singapore Data.gov.sg LTA/HDB feeds
 */

export const API_CONFIG = {
  // Configurable base URL for user's future backend server
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  
  // Flag indicating whether to route network calls through the custom backend
  USE_BACKEND_API: false,

  // Direct public Singapore Data.gov.sg Carpark Availability endpoint (CORS-friendly)
  DATA_GOV_SG_URL: 'https://api.data.gov.sg/v1/transport/carpark-availability',

  // Polling interval in ms for real-time live availability refreshes (Singapore HDB updates every 60s)
  POLL_INTERVAL_MS: 45000,
};
