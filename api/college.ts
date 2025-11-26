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

    // Check content type before parsing
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    // Get response text first to check if it's valid JSON
    const responseText = await response.text();

    if (!response.ok) {
      console.error(`API error response (${response.status}):`, responseText.substring(0, 500));
      return res.status(response.status).json({
        error: 'Failed to fetch college order from external API',
        status: response.status,
        statusText: response.statusText,
        url: apiEndpoint,
        responsePreview: responseText.substring(0, 200),
        contentType: contentType,
      });
    }

    // Validate that response is JSON
    if (!isJson) {
      console.error('API returned non-JSON response:', {
        contentType,
        preview: responseText.substring(0, 200),
      });
      return res.status(500).json({
        error: 'API returned non-JSON response',
        contentType: contentType,
        responsePreview: responseText.substring(0, 200),
        url: apiEndpoint,
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', {
        error: parseError instanceof Error ? parseError.message : String(parseError),
        preview: responseText.substring(0, 500),
      });
      return res.status(500).json({
        error: 'Failed to parse API response as JSON',
        message: parseError instanceof Error ? parseError.message : 'Unknown parse error',
        responsePreview: responseText.substring(0, 500),
        url: apiEndpoint,
      });
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching college order:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ 
      error: 'Failed to fetch college order',
      message: errorMessage,
      details: error instanceof Error ? error.stack : undefined,
    });
  }
}

