import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Allow GET and HEAD requests
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      targetApi: process.env.TARGET_API_URL || 'http://ohiopyleprints.com',
    };

    res.setHeader('Cache-Control', 'no-cache');
    return res.status(200).json(healthStatus);
  } catch (error) {
    console.error('Health check error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: errorMessage,
      stack: errorStack
    });
  }
}

