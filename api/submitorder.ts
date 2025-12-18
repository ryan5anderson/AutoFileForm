import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the order data from the request body
    const orderData = req.body;

    if (!orderData) {
      return res.status(400).json({ error: 'Order data is required' });
    }

    // Target API endpoint
    const targetApiUrl = 'http://mytownoriginals.com/api/submitorder';

    console.log(`Submitting order to: ${targetApiUrl}`);
    console.log(`Order data keys: ${Object.keys(orderData).join(', ')}`);

    // Forward the POST request to the actual API
    const response = await fetch(targetApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    // Get response text first
    const responseText = await response.text();

    // Check content type
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // If the response is not OK, forward the error
    if (!response.ok) {
      console.error(`API error response (${response.status}):`, responseText.substring(0, 500));
      
      // Try to parse as JSON if possible
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { 
          error: responseText.substring(0, 500),
          status: response.status,
          statusText: response.statusText
        };
      }

      return res.status(response.status).json({
        error: 'Failed to submit order',
        status: response.status,
        statusText: response.statusText,
        details: errorData
      });
    }

    // Try to parse JSON response
    let responseData;
    if (isJson) {
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        responseData = { message: responseText || 'Order submitted successfully' };
      }
    } else {
      // If not JSON, check if it's a success message
      if (responseText.trim() === '' || responseText.toLowerCase().includes('success')) {
        responseData = { message: 'Order submitted successfully!' };
      } else {
        responseData = { message: responseText || 'Order submitted successfully' };
      }
    }

    console.log('Order submitted successfully');
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error submitting order:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Set CORS headers even on error
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    return res.status(500).json({ 
      error: 'Failed to submit order',
      message: errorMessage,
      details: error instanceof Error ? error.stack : undefined,
    });
  }
}
