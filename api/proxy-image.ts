import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Validate that the URL is from an allowed domain
    const imageUrl = new URL(url);
    const allowedDomains = ['ohiopyleprints.com', 'mytownoriginals.com'];
    
    const isAllowed = allowedDomains.some(domain => imageUrl.hostname.includes(domain));
    
    if (!isAllowed) {
      console.error(`Image domain not allowed: ${imageUrl.hostname}. Allowed domains: ${allowedDomains.join(', ')}`);
      return res.status(403).json({ 
        error: 'Invalid image domain',
        message: `Domain ${imageUrl.hostname} is not allowed. Allowed domains: ${allowedDomains.join(', ')}`,
        hostname: imageUrl.hostname,
        allowedDomains: allowedDomains
      });
    }

    console.log(`Proxying image from: ${url}`);
    console.log(`Image hostname: ${imageUrl.hostname}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageProxy/1.0)',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      const errorText = await response.text().catch(() => 'Could not read error response');
      return res.status(response.status).json({
        error: `Failed to fetch image from source`,
        status: response.status,
        statusText: response.statusText,
        url: url,
        message: errorText.substring(0, 200)
      });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = await response.arrayBuffer();

    // Set appropriate headers for image
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    return res.status(200).send(Buffer.from(imageBuffer));
  } catch (error) {
    console.error('Error proxying image:', error);
    return res.status(500).json({ 
      error: 'Failed to proxy image',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

