import type { Request, Response } from 'express';

/**
 * Serverless Health Endpoint
 * Path: /api/health
 * 
 * Verifies system health, deployment runtime, and whether the LTA DataMall
 * AccountKey environment variable is configured.
 */
export default async function handler(req: Request, res: Response) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const accountKeyConfigured = Boolean(
    process.env.LTA_DATAMALL_ACCOUNT_KEY || process.env.LTA_ACCOUNT_KEY
  );

  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ParkSG LTA DataMall Serverless API',
    endpoints: {
      health: '/api/health',
      carparkAvailability: '/api/carparkavailability',
    },
    ltaDataMall: {
      endpoint: 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
      accountKeyConfigured,
      hint: accountKeyConfigured
        ? 'AccountKey detected in environment.'
        : 'LTA_DATAMALL_ACCOUNT_KEY is not configured yet. Add your key to .env or your serverless environment variables.',
    },
  });
}
