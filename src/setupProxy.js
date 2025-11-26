const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('[setupProxy] Loading proxy configuration...');
  console.log('[setupProxy] Setting up proxy for /api to http://ohiopyleprints.com');
  
  const proxyMiddleware = createProxyMiddleware({
    target: 'http://ohiopyleprints.com',
    changeOrigin: true,
    secure: false,
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
      console.log('[setupProxy] Proxying request:', req.url, 'to', 'http://ohiopyleprints.com' + req.url);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log('[setupProxy] Proxy response:', proxyRes.statusCode, 'for', req.url);
    },
    onError: (err, req, res) => {
      console.error('[setupProxy] Proxy error:', err);
    }
  });
  
  app.use('/api', proxyMiddleware);
  console.log('[setupProxy] Proxy middleware registered for /api');
};

