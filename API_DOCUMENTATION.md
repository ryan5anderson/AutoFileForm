# API Documentation

## Overview

Vercel serverless functions that proxy requests between the frontend and external APIs. **Currently only used in test routes** (`/test-api/*`). Production routes use static config files.

**Data Sources:**
- `ohiopyleprints.com` - Primary API
- `mytownoriginals.com` - Images

**Architecture:** `Frontend → Service Layer → Vercel Functions → External APIs`

---

## Endpoints

### 1. Health Check
**`GET /api/health`**

Returns API status and configuration.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production",
  "targetApi": "http://ohiopyleprints.com"
}
```

**Usage:** Called by test routes to verify API connectivity before data requests.

---

### 2. Fetch Colleges
**`GET /api/colleges`**

Returns list of all available colleges.

**Response:** Array of college objects
```json
[
  {
    "school_ID": "123",
    "schoolName": "Alabama University",
    "logoUrl": "http://example.com/logo.png",
    "orderNumTemplate": "AL-001"
  }
]
```

**External API:** `{TARGET_API_URL}/api/colleges` (default: `http://ohiopyleprints.com/api/colleges`)

**When Called:** `/test-api` route on page load

**Response Handling:** Automatically unwraps `{ data: [...] }` or `{ colleges: [...] }` formats to return array.

---

### 3. Fetch College Order
**`GET /api/college?id={orderTemplateId}`**

Returns order template data for a specific college.

**Query Parameters:**
- `id` (required): Order template ID

**Response:** Array of order items
```json
[
  {
    "Expr1": "unique-item-id",
    "ORDER_NUM": "12345",
    "DESIGN_NUM": "67890",
    "SHIRTNAME": "T-Shirt Name",
    "productUrl": "http://example.com/image.png",
    "size1": "S", "size2": "M", ...
  }
]
```

**External API:** `{TARGET_API_URL}/api/college?id={id}`

**When Called:** 
- `/test-api/{orderTemplateId}` - On page load
- `/test-api/{orderTemplateId}/product/{itemId}` - On page load

**Response Handling:** Automatically unwraps `{ data: [...] }` or `{ items: [...] }` formats.

---

### 4. Proxy Image
**`GET /api/proxy-image?url={encodedUrl}`**

Proxies images from external domains to bypass CORS.

**Query Parameters:**
- `url` (required): Encoded image URL

**Response:** Binary image data with appropriate Content-Type

**Security:**
- Only allows: `ohiopyleprints.com`, `mytownoriginals.com`
- Returns 403 for other domains

**Caching:** Browser cache for 24 hours (`Cache-Control: public, max-age=86400`)

**Usage:**
```typescript
import { getProxiedImageUrl } from './services/collegeApiService';
const imageUrl = getProxiedImageUrl('http://ohiopyleprints.com/image.png');
```

**Performance Note:** Adds ~100-300ms latency on first request. Subsequent requests are cached (0ms).

---

## Configuration

**Environment Variables:**

- `REACT_APP_API_BASE_URL` (Frontend)
  - Default: `/api`
  - Set in: `vercel.json`

- `TARGET_API_URL` (Backend)
  - Default: `http://ohiopyleprints.com`
  - Set in: Vercel environment variables

**Future:** Environment-specific URLs (dev/staging/prod) - not yet implemented.

---

## Usage

### Current Usage (Testing Only)

**Test Routes:**
- `/test-api` → Uses `fetchColleges()`, `checkApiHealth()`
- `/test-api/{orderTemplateId}` → Uses `fetchCollegeOrder()`
- `/test-api/{orderTemplateId}/product/{itemId}` → Uses `fetchCollegeOrder()`

**Production Routes:** Use static config files (`src/config/colleges/*.json`), NOT the API.

### Fetching Behavior
- **No polling:** Fetches only on component mount or route parameter changes
- **No frontend caching:** Each navigation triggers new API call
- **Image caching:** 24-hour browser cache via HTTP headers

---

## Error Handling

**Error Response Format:**
```json
{
  "error": "Error message",
  "status": 500,
  "statusText": "Internal Server Error",
  "url": "http://...",
  "responsePreview": "..."
}
```

**Common Errors:**
- `400` - Missing/invalid parameters
- `403` - Domain not whitelisted (image proxy)
- `405` - Method not allowed
- `500` - External API failure or parsing error

**Health Check Pattern:**
```typescript
const healthCheck = await checkApiHealth();
if (!healthCheck.healthy) {
  // Handle error
  return;
}
const data = await fetchColleges();
```

**Fallback Strategy:** Not yet implemented. Should fallback to static config files when API fails.

---

## Security

- **CORS:** All endpoints allow all origins (`*`)
- **Domain Whitelist:** Image proxy only allows `ohiopyleprints.com` and `mytownoriginals.com`
- **Method Restrictions:** GET/OPTIONS only (HEAD for health)
- **Input Validation:** URL encoding, type checking, required parameters

---

## Caching

- **Images:** 24-hour browser cache
- **API Responses:** No caching (every request hits external API)
- **Health Check:** No cache (always fresh)

**Future:** Consider caching college list and order templates (they change infrequently).

---

## Code Examples

### Fetch Colleges
```typescript
import { fetchColleges, checkApiHealth } from './services/collegeApiService';

const healthCheck = await checkApiHealth();
if (!healthCheck.healthy) return;

const colleges = await fetchColleges();
```

### Fetch College Order
```typescript
import { fetchCollegeOrder } from './services/collegeApiService';

const orderItems = await fetchCollegeOrder('AL-001');
const filtered = orderItems.filter(item => 
  !item.SHIRTNAME?.includes('ORDER REVIEW')
);
```

### Image Proxy
```typescript
import { getProxiedImageUrl } from './services/collegeApiService';

const imageUrl = getProxiedImageUrl('http://ohiopyleprints.com/image.png');
<img src={imageUrl} alt="Product" />
```

---

## Future Improvements

**High Priority:**
1. Environment-specific configuration (dev/staging/prod)
2. Fallback to static config files when API fails
3. Better error handling with retry logic

**Medium Priority:**
4. Response caching for infrequently changing data
5. Monitoring and error tracking
6. Rate limiting

**Low Priority:**
7. API versioning
8. Request batching
9. Response compression

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Check `Access-Control-Allow-Origin` header |
| 403 on images | Add domain to whitelist in `api/proxy-image.ts` |
| Non-JSON response | Check external API is responding correctly |
| Empty array | Verify `orderTemplateId` is correct |
| Wrong API URL | Set `TARGET_API_URL` in Vercel environment variables |

---

## File Structure

```
api/
├── health.ts          # Health check
├── colleges.ts       # Fetch colleges
├── college.ts        # Fetch college order
└── proxy-image.ts    # Image proxy

src/services/
└── collegeApiService.ts  # Frontend service layer
```

---

**Status:** Testing Phase  
**Last Updated:** 2024-01-15
