import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Order template ID is required' });
    }

    const targetApiUrl = process.env.TARGET_API_URL || 'http://ohiopyleprints.com';
    const apiEndpoint = `${targetApiUrl}/api/college?id=${encodeURIComponent(id)}`;

    console.log(`Fetching college order from: ${apiEndpoint}`);

    const response = await fetch(apiEndpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching college order:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch college order',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
