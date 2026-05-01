/** Query params for /api-school/:id store-manager deep links (must match ApiCollegeOrderProvider). */
export const STORE_MANAGER_LINK_FLAG_PARAM = 'sm';
export const STORE_MANAGER_LINK_COMPANY_PARAM = 'company';
export const STORE_MANAGER_LINK_STORE_NUMBER_PARAM = 'storeNumber';
export const STORE_MANAGER_LINK_PO_NUMBER_PARAM = 'poNumber';

/** Trim whitespace from API school id (API/list data often includes trailing spaces; URLs encode them as %20). */
export function normalizeApiOrderTemplateId(id: string | undefined | null): string | undefined {
  if (id == null) return undefined;
  const t = String(id).trim();
  return t.length > 0 ? t : undefined;
}

export function buildStoreManagerOrderUrl(
  orderTemplateId: string,
  company: string,
  storeNumber: string,
  poNumber: string,
  origin: string = typeof window !== 'undefined' ? window.location.origin : ''
): string {
  const nid = normalizeApiOrderTemplateId(orderTemplateId) ?? '';
  const path = `/api-school/${encodeURIComponent(nid)}`;
  const params = new URLSearchParams();
  params.set(STORE_MANAGER_LINK_FLAG_PARAM, '1');
  params.set(STORE_MANAGER_LINK_COMPANY_PARAM, company);
  params.set(STORE_MANAGER_LINK_STORE_NUMBER_PARAM, storeNumber);
  params.set(STORE_MANAGER_LINK_PO_NUMBER_PARAM, poNumber);
  return `${origin}${path}?${params.toString()}`;
}

/** Keep store-manager query params when moving between form, summary, receipt, and product detail. */
export function appendSearchToPath(path: string, searchParams: URLSearchParams): string {
  const s = searchParams.toString();
  return s ? `${path}?${s}` : path;
}
