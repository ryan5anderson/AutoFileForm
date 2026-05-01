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

  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText) as unknown;
  } catch {
    throw new Error(`${label} returned invalid JSON from ${endpoint}.`);
  }

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

/**
 * College order endpoint sometimes returns different wrappers; avoid 500 for odd shapes.
 * Some hosts return text/html or wrong Content-Type even when the body is JSON or empty.
 */
const parseItemsResponseLenient = async (response: Response, endpoint: string): Promise<unknown[]> => {
  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  const responseText = await response.text();
  const trimmed = responseText.trim();

  if (!response.ok) {
    const hint = trimmed ? trimmed.substring(0, 280) : '(empty body)';
    throw new Error(
      `College order request failed (${response.status} ${response.statusText}) from ${endpoint}. Response: ${hint}`
    );
  }

  if (!trimmed) {
    return [];
  }

  const looksLikeHtml = /^<!DOCTYPE/i.test(trimmed) || /^<\s*html/i.test(trimmed);
  if (looksLikeHtml) {
    const snippet = trimmed.replace(/\s+/g, ' ').substring(0, 200);
    throw new Error(
      `College order returned HTML instead of JSON from ${endpoint} (wrong path, redirect, or server error page). Snippet: ${snippet}`
    );
  }

  const tryParseBody = (): unknown | null => {
    try {
      return JSON.parse(responseText) as unknown;
    } catch {
      return null;
    }
  };

  let parsed: unknown | null = null;
  if (contentType.includes('application/json') || contentType.includes('+json')) {
    parsed = tryParseBody();
  } else if (/^\s*[\[{]/.test(trimmed)) {
    parsed = tryParseBody();
  }

  if (parsed === null) {
    const hint = trimmed.substring(0, 280);
    throw new Error(
      `College order returned non-JSON from ${endpoint}. Content-Type: "${contentType || 'unknown'}". Body: ${hint}`
    );
  }

  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (parsed && typeof parsed === 'object') {
    const r = parsed as Record<string, unknown>;
    const candidates = ['data', 'items', 'products', 'orderItems', 'order_items', 'lines'] as const;
    for (const key of candidates) {
      if (Array.isArray(r[key])) {
        return r[key] as unknown[];
      }
    }
  }

  return [];
};

const normalizeTemplateId = (value: string | undefined | null): string => (value == null ? '' : String(value).trim());

const findCollegeForTemplate = (colleges: CollegeListItem[], orderTemplateId: string): CollegeListItem | null => {
  const want = normalizeTemplateId(orderTemplateId);
  if (!want) return null;
  const direct =
    colleges.find((c) => normalizeTemplateId(c.orderNumTemplate) === want) ||
    colleges.find((c) => normalizeTemplateId(c.school_ID) === want) ||
    null;
  if (direct) return direct;
  return (
    colleges.find(
      (c) =>
        normalizeTemplateId(c.orderNumTemplate).toUpperCase() === want.toUpperCase() ||
        normalizeTemplateId(c.school_ID).toUpperCase() === want.toUpperCase()
    ) || null
  );
};

const fetchJsonHeaders = {
  Accept: 'application/json',
  'User-Agent': 'CampusTraditions-OrderForm/1.0',
};

const fetchFreshSchoolPageData = async (orderTemplateId: string): Promise<SchoolPageData> => {
  const normalizedId = normalizeTemplateId(orderTemplateId);
  const collegesEndpoint = resolveCollegesEndpoint();

  const collegesResponse = await fetch(collegesEndpoint, {
    method: 'GET',
    headers: fetchJsonHeaders,
  });

  const collegesRaw = await parseArrayResponse(collegesResponse, collegesEndpoint, 'Colleges');
  const colleges = collegesRaw as CollegeListItem[];
  const matchedSchool = findCollegeForTemplate(colleges, normalizedId);
  const nowMs = Date.now();
  const expiresAtMs = nowMs + CACHE_TTL_MS;
  const canonicalTemplate =
    normalizeTemplateId(matchedSchool?.orderNumTemplate) || normalizedId;
  const collegeEndpoint = resolveCollegeEndpoint(canonicalTemplate);

  const itemsResponse = await fetch(collegeEndpoint, {
    method: 'GET',
    headers: fetchJsonHeaders,
  });
  const items = await parseItemsResponseLenient(itemsResponse, collegeEndpoint);

  return {
    orderTemplateId: canonicalTemplate,
    school: matchedSchool
      ? {
          schoolId: matchedSchool.school_ID || null,
          schoolName: matchedSchool.schoolName || null,
          logoUrl: matchedSchool.logoUrl || null,
          orderTemplateId: normalizeTemplateId(matchedSchool.orderNumTemplate) || canonicalTemplate,
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

  const rawId = req.query.id;
  const idParam = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!idParam || typeof idParam !== 'string') {
    return res.status(400).json({ error: 'Order template ID is required' });
  }
  const id = idParam.trim();
  if (!id) {
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
