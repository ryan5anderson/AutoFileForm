/**
 * Setup Proxy for Create React App
 * 
 * This file proxies API requests to the Vercel dev server when running locally.
 * 
 * For local development:
 * 1. Run `npm run dev` (runs both Vercel dev server and React app)
 * 2. Or run `vercel dev` in one terminal and `npm start` in another
 * 
 * The proxy forwards all /api/* requests to http://localhost:3001 (Vercel dev default port)
 * 
 * In production (Vercel), API routes are handled automatically by Vercel serverless functions.
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Get the Vercel dev server port from environment or use default
  const vercelDevPort = process.env.VERCEL_DEV_PORT || 3001;
  const vercelDevUrl = `http://localhost:${vercelDevPort}`;

  // Proxy all /api/* requests to Vercel dev server
  app.use(
    '/api',
    createProxyMiddleware({
      target: vercelDevUrl,
      changeOrigin: true,
      logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
      onError: (err, req, res) => {
        console.error('Proxy error:', err.message);
        console.error(`Make sure Vercel dev server is running on ${vercelDevUrl}`);
        console.error('Run: vercel dev (in a separate terminal) or npm run dev');
        
        // Return a helpful error response
        if (!res.headersSent) {
          res.status(503).json({
            error: 'API server not available',
            message: `Cannot connect to Vercel dev server at ${vercelDevUrl}`,
            solution: 'Run "vercel dev" in a separate terminal, or use "npm run dev" to start both servers'
          });
        }
      },
      onProxyReq: (proxyReq, req, res) => {
        // Log proxied requests in development
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[Proxy] ${req.method} ${req.url} -> ${vercelDevUrl}${req.url}`);
        }
      }
    })
  );
};
