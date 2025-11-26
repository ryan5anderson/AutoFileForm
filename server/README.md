# College API Proxy Server

This Express.js proxy server solves CORS issues by acting as an intermediary between the React frontend and the external API at `ohiopyleprints.com`.

## Setup

1. **Install dependencies** (first time only):
   ```bash
   cd server
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

   The server will run on `http://localhost:5000`

## Usage

### Running Server Only
```bash
npm start
```

### Running with Auto-reload (Development)
```bash
npm run dev
```

### Running Both Frontend and Backend Together
From the project root:
```bash
npm run dev
```

## Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/colleges` - Proxies requests to `http://ohiopyleprints.com/api/colleges`

## Environment Variables

- `PORT` - Server port (default: 5000)

## Troubleshooting

- **Port already in use**: Change the PORT in `server.js` or set `PORT` environment variable
- **CORS errors**: Ensure the frontend origin matches the CORS configuration in `server.js`
- **API connection issues**: Check that `ohiopyleprints.com/api/colleges` is accessible

