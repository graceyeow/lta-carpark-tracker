import type { Request, Response } from 'express';

const LTA_DATAMALL_ENDPOINT = 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

export interface LTACarparkItem {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string; // "lat lng" (e.g. "1.2935 103.8572")
  AvailableLots: number;
  LotType: 'C' | 'M' | 'H'; // C: Car, M: Motorcycle, H: Heavy Vehicle
  Agency: 'HDB' | 'LTA' | 'URA';
}

export interface LTAResponse {
  'odata.metadata'?: string;
  value: LTACarparkItem[];
}

/**
 * Serverless Carpark Availability Endpoint
 * Path: /api/carparkavailability
 * 
 * Fetches real-time lot availability from Singapore Land Transport Authority (LTA)
 * DataMall OData service (CarParkAvailabilityv2).
 * 
 * Authentication: Requires an LTA AccountKey provided via the
 * 'LTA_DATAMALL_ACCOUNT_KEY' or 'LTA_ACCOUNT_KEY' environment variable, or via
 * request header 'AccountKey'.
 */
export default async function handler(req: Request, res: Response) {
  // Set CORS headers so frontend can call this serverless endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, accountkey');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Retrieve AccountKey from environment or request headers (do not hardcode)
  const accountKey = 
    process.env.LTA_DATAMALL_ACCOUNT_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    (req.headers['accountkey'] as string) ||
    (req.headers['account-key'] as string);

  // If key is not yet configured, return informative response without throwing
  if (!accountKey || accountKey.trim() === '' || accountKey.includes('YOUR_LTA_DATAMALL_ACCOUNT_KEY')) {
    return res.status(200).json({
      status: 'waiting_for_key',
      configured: false,
      message: "LTA DataMall AccountKey is not yet configured. Please set the 'LTA_DATAMALL_ACCOUNT_KEY' environment variable with your key from LTA DataMall.",
      help: 'Apply for a free key at: https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html',
      endpoint: LTA_DATAMALL_ENDPOINT,
      timestamp: new Date().toISOString(),
      value: [],
    });
  }

  try {
    const skip = req.query.skip || req.query['$skip'];
    const fetchAll = req.query.all === 'true';

    // Helper to fetch one page from LTA DataMall
    const fetchPage = async (skipCount: number = 0): Promise<LTACarparkItem[]> => {
      const url = skipCount > 0 
        ? `${LTA_DATAMALL_ENDPOINT}?$skip=${skipCount}` 
        : LTA_DATAMALL_ENDPOINT;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          AccountKey: accountKey.trim(),
          accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`LTA DataMall responded with HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as LTAResponse;
      return data.value || [];
    };

    let allItems: LTACarparkItem[] = [];

    if (fetchAll) {
      // LTA returns records in batches of 500
      let currentSkip = 0;
      let hasMore = true;
      while (hasMore && currentSkip < 5000) {
        const batch = await fetchPage(currentSkip);
        allItems = allItems.concat(batch);
        if (batch.length < 500) {
          hasMore = false;
        } else {
          currentSkip += 500;
        }
      }
    } else {
      const skipNum = skip ? parseInt(skip as string, 10) : 0;
      allItems = await fetchPage(skipNum);
    }

    // Cache responses for 30s at edge / CDN to stay within LTA rate limits
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

    return res.status(200).json({
      status: 'success',
      configured: true,
      source: 'LTA DataMall (CarParkAvailabilityv2)',
      timestamp: new Date().toISOString(),
      totalRecords: allItems.length,
      value: allItems,
    });
  } catch (error: any) {
    console.error('Error fetching LTA DataMall CarParkAvailabilityv2:', error);
    return res.status(502).json({
      status: 'error',
      configured: true,
      message: `Failed to fetch data from LTA DataMall: ${error.message || 'Unknown network error'}`,
      endpoint: LTA_DATAMALL_ENDPOINT,
      timestamp: new Date().toISOString(),
      value: [],
    });
  }
}
