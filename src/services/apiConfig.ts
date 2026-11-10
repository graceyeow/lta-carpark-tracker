/**
 * ParkSG Backend & Serverless API Configuration
 * 
 * Serverless Endpoints:
 * - GET /api/health               => Verifies system health & LTA key configuration
 * - GET /api/carparkavailability  => Pulls live HDB, LTA, and URA carparks from LTA DataMall
 * 
 * LTA DataMall Endpoint:
 * - https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
 * - Header: AccountKey (configured in process.env.LTA_DATAMALL_ACCOUNT_KEY)
 */

export const API_CONFIG = {
  // Serverless API base URL
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  USE_BACKEND_API: false,
  
  // Local/deployed serverless endpoints
  HEALTH_ENDPOINT: '/api/health',
  CARPARK_AVAILABILITY_ENDPOINT: '/api/carparkavailability',

  // Direct public Singapore Data.gov.sg Carpark Availability endpoint (CORS-friendly fallback)
  DATA_GOV_SG_URL: 'https://api.data.gov.sg/v1/transport/carpark-availability',

  // Polling interval in ms for real-time live availability refreshes
  POLL_INTERVAL_MS: 45000,
};
