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
    // Get base URL - ensure it doesn't end with a slash
    let targetApiUrl = process.env.TARGET_API_URL || 'http://ohiopyleprints.com';
    targetApiUrl = targetApiUrl.replace(/\/$/, ''); // Remove trailing slash
    
    // If the URL already contains /api/colleges, use it as-is, otherwise append /api/colleges
    let apiEndpoint: string;
    if (targetApiUrl.includes('/api/colleges')) {
      apiEndpoint = targetApiUrl;
    } else {
      apiEndpoint = `${targetApiUrl}/api/colleges`;
    }

    console.log(`Fetching colleges from: ${apiEndpoint}`);
    console.log(`TARGET_API_URL env var: ${process.env.TARGET_API_URL || 'not set'}`);
    console.log(`Constructed endpoint: ${apiEndpoint}`);

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
        error: 'Failed to fetch colleges from external API',
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
    console.error('Error fetching colleges:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ 
      error: 'Failed to fetch colleges',
      message: errorMessage,
      details: error instanceof Error ? error.stack : undefined,
    });
  }
}

