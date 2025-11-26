import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({ 
    message: 'Test endpoint working',
    method: req.method,
    timestamp: new Date().toISOString()
  });
}

