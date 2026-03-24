import type { VercelRequest, VercelResponse } from '@vercel/node';

const CACHE_TTL_MS = 30 * 60 * 1000;

interface CollegeListItem {
  school_ID?: string;
  schoolName?: string;
  logoUrl?: string | null;
  orderNumTemplate?: string;
  [key: string]: unknown;
}

interface SchoolPageData {
  orderTemplateId: string;
  school: {
    schoolId: string | null;
    schoolName: string | null;
    logoUrl: string | null;
    orderTemplateId: string;
  } | null;
  items: unknown[];
  fetchedAt: string;
  expiresAt: string;
}

interface CacheEntry {
  data: SchoolPageData;
  expiresAtMs: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __schoolPageCache: Map<string, CacheEntry> | undefined;
  // eslint-disable-next-line no-var
  var __schoolPageInFlight: Map<string, Promise<SchoolPageData>> | undefined;
}

const schoolPageCache = globalThis.__schoolPageCache ?? new Map<string, CacheEntry>();
const schoolPageInFlight = globalThis.__schoolPageInFlight ?? new Map<string, Promise<SchoolPageData>>();

globalThis.__schoolPageCache = schoolPageCache;
globalThis.__schoolPageInFlight = schoolPageInFlight;

const getBaseTargetApiUrl = (): string => {
  const configured = process.env.TARGET_API_URL || 'http://ohiopyleprints.com';
  return configured.replace(/\/$/, '');
};

const resolveCollegesEndpoint = (): string => {
  const baseUrl = getBaseTargetApiUrl();
  return baseUrl.includes('/api/colleges') ? baseUrl : `${baseUrl}/api/colleges`;
};

const resolveCollegeEndpoint = (orderTemplateId: string): string => {
  const baseUrl = getBaseTargetApiUrl();
  const encodedId = encodeURIComponent(orderTemplateId);
  return baseUrl.includes('/api/college')
    ? `${baseUrl}?id=${encodedId}`
    : `${baseUrl}/api/college?id=${encodedId}`;
};

const parseArrayResponse = async (response: Response, endpoint: string, label: string): Promise<unknown[]> => {
  const contentType = response.headers.get('content-type') || '';
  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `${label} request failed (${response.status} ${response.statusText}) from ${endpoint}. ` +
        `Response: ${responseText.substring(0, 200)}`
    );
  }

  if (!contentType.includes('application/json')) {
    throw new Error(
      `${label} returned non-JSON response from ${endpoint}. ` +
        `Content-Type: ${contentType}. Response: ${responseText.substring(0, 200)}`
    );
  }

  const parsed = JSON.parse(responseText) as unknown;

  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (parsed && typeof parsed === 'object') {
    const record = parsed as { data?: unknown; items?: unknown };
    if (Array.isArray(record.data)) {
      return record.data;
    }
    if (Array.isArray(record.items)) {
      return record.items;
    }
  }

  throw new Error(`${label} payload was not an array from ${endpoint}.`);
};

const fetchFreshSchoolPageData = async (orderTemplateId: string): Promise<SchoolPageData> => {
  const collegesEndpoint = resolveCollegesEndpoint();
  const collegeEndpoint = resolveCollegeEndpoint(orderTemplateId);

  const [collegesResponse, itemsResponse] = await Promise.all([
    fetch(collegesEndpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    }),
    fetch(collegeEndpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    }),
  ]);

  const [collegesRaw, items] = await Promise.all([
    parseArrayResponse(collegesResponse, collegesEndpoint, 'Colleges'),
    parseArrayResponse(itemsResponse, collegeEndpoint, 'College order'),
  ]);

  const colleges = collegesRaw as CollegeListItem[];
  const matchedSchool = colleges.find((college) => college.orderNumTemplate === orderTemplateId) || null;
  const nowMs = Date.now();
  const expiresAtMs = nowMs + CACHE_TTL_MS;

  return {
    orderTemplateId,
    school: matchedSchool
      ? {
          schoolId: matchedSchool.school_ID || null,
          schoolName: matchedSchool.schoolName || null,
          logoUrl: matchedSchool.logoUrl || null,
          orderTemplateId: matchedSchool.orderNumTemplate || orderTemplateId,
        }
      : null,
    items,
    fetchedAt: new Date(nowMs).toISOString(),
    expiresAt: new Date(expiresAtMs).toISOString(),
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Order template ID is required' });
  }

  const now = Date.now();
  const cached = schoolPageCache.get(id);

  if (cached && cached.expiresAtMs > now) {
    res.setHeader('X-Cache-Status', 'HIT');
    return res.status(200).json(cached.data);
  }

  try {
    let inFlight = schoolPageInFlight.get(id);
    if (!inFlight) {
      inFlight = fetchFreshSchoolPageData(id);
      schoolPageInFlight.set(id, inFlight);
    }

    const freshData = await inFlight;
    const expiresAtMs = Date.parse(freshData.expiresAt);
    schoolPageCache.set(id, {
      data: freshData,
      expiresAtMs: Number.isFinite(expiresAtMs) ? expiresAtMs : now + CACHE_TTL_MS,
    });
    schoolPageInFlight.delete(id);

    res.setHeader('X-Cache-Status', 'MISS');
    return res.status(200).json(freshData);
  } catch (error) {
    schoolPageInFlight.delete(id);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      error: 'Failed to fetch school page data',
      message,
    });
  }
}
