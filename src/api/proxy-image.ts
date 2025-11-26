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
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Validate that the URL is from the expected domain
    const imageUrl = new URL(url);
    const allowedDomain = 'ohiopyleprints.com';
    
    if (!imageUrl.hostname.includes(allowedDomain)) {
      return res.status(403).json({ error: 'Invalid image domain' });
    }

    console.log(`Proxying image from: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
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
