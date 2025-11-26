const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend (localhost:3000)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Proxy server is running' });
});

// Proxy endpoint for colleges API
app.get('/api/colleges', async (req, res) => {
  try {
    console.log('Fetching colleges from ohiopyleprints.com...');
    
    const response = await fetch('http://ohiopyleprints.com/api/colleges');
    
    if (!response.ok) {
      console.error(`Upstream API error: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({
        success: false,
        error: `Upstream API returned status ${response.status}`,
        message: 'Failed to fetch from external API'
      });
    }
    
    const data = await response.json();
    console.log(`Successfully fetched ${data.data?.length || 0} colleges`);
    
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error while fetching colleges'
    });
  }
});

// Proxy endpoint for college order data
app.get('/api/college', async (req, res) => {
  try {
    const orderId = req.query.id;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Missing id parameter',
        message: 'Please provide an order ID in the query string'
      });
    }
    
    console.log(`Fetching college order data for ID: ${orderId}`);
    
    const response = await fetch(`http://ohiopyleprints.com/api/college?id=${orderId}`);
    
    if (!response.ok) {
      console.error(`Upstream API error: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({
        success: false,
        error: `Upstream API returned status ${response.status}`,
        message: 'Failed to fetch college order data from external API'
      });
    }
    
    const data = await response.json();
    console.log(`Successfully fetched college order data for ID: ${orderId}`);
    
    res.json(data);
  } catch (error) {
    console.error('College order proxy error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error while fetching college order data'
    });
  }
});

// Proxy endpoint for test-api order data by order template ID
app.get('/test-api/:orderTemplateId', async (req, res) => {
  try {
    const orderTemplateId = req.params.orderTemplateId;
    
    if (!orderTemplateId) {
      return res.status(400).json({
        success: false,
        error: 'Missing orderTemplateId parameter',
        message: 'Please provide an order template ID in the URL path'
      });
    }
    
    console.log(`Fetching test-api order data for order template ID: ${orderTemplateId}`);
    
    const response = await fetch(`http://ohiopyleprints.com/test-api/${orderTemplateId}`);
    
    if (!response.ok) {
      console.error(`Upstream API error: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({
        success: false,
        error: `Upstream API returned status ${response.status}`,
        message: 'Failed to fetch test-api order data from external API'
      });
    }
    
    const data = await response.json();
    console.log(`Successfully fetched test-api order data for order template ID: ${orderTemplateId}`);
    
    res.json(data);
  } catch (error) {
    console.error('Test-api proxy error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error while fetching test-api order data'
    });
  }
});

// Proxy endpoint for images (to bypass CORS)
app.get('/api/proxy-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing url parameter',
        message: 'Please provide an image URL in the query string'
      });
    }
    
    console.log(`Proxying image: ${imageUrl}`);
    
    // Fetch the image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.error(`Image fetch error: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({
        success: false,
        error: `Failed to fetch image: ${response.status} ${response.statusText}`,
        message: 'Image not found or server error'
      });
    }
    
    // Get content type from response or default to image
    const contentType = response.headers.get('content-type') || 'image/png';
    
    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Stream the image data
    const imageBuffer = await response.buffer();
    res.send(imageBuffer);
    
    console.log(`Successfully proxied image: ${imageUrl} (${imageBuffer.length} bytes)`);
  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error while proxying image'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message,
    message: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`✅ Proxy server running on http://localhost:${PORT}`);
  console.log(`   API endpoint: http://localhost:${PORT}/api/colleges`);
  console.log(`   College order: http://localhost:${PORT}/api/college?id=<order-id>`);
  console.log(`   Test API order: http://localhost:${PORT}/test-api/<order-template-id>`);
  console.log(`   Image proxy: http://localhost:${PORT}/api/proxy-image?url=<image-url>`);
});

