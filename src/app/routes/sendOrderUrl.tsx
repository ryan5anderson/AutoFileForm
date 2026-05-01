import React from 'react';

import { sanitizeSingleLineInput } from '../../features/utils/sanitize';
import { buildStoreManagerOrderUrl, normalizeApiOrderTemplateId } from '../../features/utils/storeManagerLink';
import { fetchColleges, getCollegesFromCache, type CollegeData } from '../../services/collegeApiService';
import Footer from '../layout/Footer';
import '../../styles/college-pages.css';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 'var(--space-3)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius)',
  fontSize: '1rem',
  background: 'var(--color-input-bg)',
  color: '#000',
  boxSizing: 'border-box',
};

const SendOrderUrlPage: React.FC = () => {
  const [apiColleges, setApiColleges] = React.useState<CollegeData[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [schoolComboOpen, setSchoolComboOpen] = React.useState(false);
  const [schoolComboText, setSchoolComboText] = React.useState('');
  const [selectedOrderTemplateId, setSelectedOrderTemplateId] = React.useState('');
  const [storeName, setStoreName] = React.useState('');
  const [storeNumber, setStoreNumber] = React.useState('');
  const [poNumber, setPoNumber] = React.useState('');
  const [copyFeedback, setCopyFeedback] = React.useState(false);
  const comboRef = React.useRef<HTMLDivElement>(null);
  const listId = 'send-url-college-listbox';

  const fetchApiColleges = React.useCallback(async () => {
    const dedupe = (list: CollegeData[]): CollegeData[] => {
      const seen = new Set<string>();
      return list.filter((college) => {
        const key = normalizeApiOrderTemplateId(college.orderNumTemplate) || college.school_ID.trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    const cached = getCollegesFromCache();
    if (cached) {
      setApiColleges(dedupe(cached));
      setApiError(null);
      return;
    }

    setIsLoading(true);
    setApiError(null);
    try {
      const results = await fetchColleges();
      setApiColleges(dedupe(results));
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to fetch API schools.');
      setApiColleges([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchApiColleges();
  }, [fetchApiColleges]);

  React.useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!comboRef.current?.contains(e.target as Node)) {
        setSchoolComboOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  const filteredColleges = React.useMemo(() => {
    const q = schoolComboText.trim().toLowerCase();
    if (!q) return apiColleges;
    return apiColleges.filter(
      (c) =>
        c.schoolName.toLowerCase().includes(q) ||
        c.school_ID.trim().toLowerCase().includes(q) ||
        (normalizeApiOrderTemplateId(c.orderNumTemplate) || '').toLowerCase().includes(q)
    );
  }, [apiColleges, schoolComboText]);

  const pickSchool = React.useCallback((c: CollegeData) => {
    const templateId = normalizeApiOrderTemplateId(c.orderNumTemplate) ?? '';
    if (!templateId) return;
    setSelectedOrderTemplateId(templateId);
    setSchoolComboText(c.schoolName);
    setSchoolComboOpen(false);
  }, []);

  const onComboInputChange = React.useCallback((value: string) => {
    setSchoolComboText(value);
    setSelectedOrderTemplateId('');
    setSchoolComboOpen(true);
  }, []);

  const generatedUrl = React.useMemo(() => {
    if (!selectedOrderTemplateId || !storeName.trim() || !storeNumber.trim() || !poNumber.trim()) return '';
    return buildStoreManagerOrderUrl(selectedOrderTemplateId, storeName.trim(), storeNumber.trim(), poNumber.trim());
  }, [selectedOrderTemplateId, storeName, storeNumber, poNumber]);

  const handleCopy = React.useCallback(async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      setCopyFeedback(false);
    }
  }, [generatedUrl]);

  return (
    <div className="summary-page-container">
      <main className="summary-page-main" style={{ maxWidth: 640 }}>
        <h1 style={{ color: 'var(--color-primary, #2563eb)', marginBottom: 'var(--space-2)', textAlign: 'center' }}>
          Send order URL
        </h1>
        <p style={{ color: 'var(--color-text)', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          Choose a college and store details to build a link. The recipient will only enter ordered by and date on the
          order form.
        </p>

        {apiError && <div className="error-message">{apiError}</div>}
        {isLoading && apiColleges.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>Loading schools...</div>
        )}

        {!isLoading || apiColleges.length > 0 ? (
          <div className="summary-card" style={{ marginBottom: 'var(--space-4)' }}>
            <div ref={comboRef} style={{ marginBottom: 'var(--space-4)', position: 'relative' }}>
              <label
                htmlFor="send-url-college-combo"
                style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--color-text)' }}
              >
                College (API school)
              </label>
              <input
                id="send-url-college-combo"
                type="text"
                role="combobox"
                aria-expanded={schoolComboOpen}
                aria-controls={listId}
                aria-autocomplete="list"
                value={schoolComboText}
                onChange={(e) => onComboInputChange(e.target.value)}
                onFocus={() => setSchoolComboOpen(true)}
                placeholder="Search by school name or ID…"
                autoComplete="off"
                style={inputStyle}
              />
              {schoolComboOpen && filteredColleges.length > 0 && (
                <div
                  id={listId}
                  role="listbox"
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '100%',
                    margin: '4px 0 0',
                    padding: 0,
                    maxHeight: 240,
                    overflowY: 'auto',
                    background: 'var(--color-input-bg, #fff)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    zIndex: 20,
                  }}
                >
                  {filteredColleges.map((c) => {
                    const tid = normalizeApiOrderTemplateId(c.orderNumTemplate) ?? '';
                    const schoolId = c.school_ID.trim();
                    return (
                      <button
                        key={`${tid || schoolId}-${c.schoolName}`}
                        type="button"
                        role="option"
                        aria-selected={selectedOrderTemplateId === tid}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          pickSchool(c);
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          padding: 'var(--space-3)',
                          border: 'none',
                          borderBottom: '1px solid var(--color-border)',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          color: '#000',
                        }}
                      >
                        {c.schoolName}
                        <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>
                          Template: {tid || 'Unavailable'}{schoolId ? ` · School ID: ${schoolId}` : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              {schoolComboOpen && schoolComboText.trim() && filteredColleges.length === 0 && (
                <div
                  style={{
                    ...inputStyle,
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '100%',
                    marginTop: 4,
                    background: 'var(--color-surface)',
                    zIndex: 20,
                  }}
                >
                  No schools match “{schoolComboText.trim()}”.
                </div>
              )}
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label
                htmlFor="send-url-store-name"
                style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--color-text)' }}
              >
                Store name
              </label>
              <input
                id="send-url-store-name"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(sanitizeSingleLineInput(e.target.value))}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label
                htmlFor="send-url-store-number"
                style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--color-text)' }}
              >
                Store number
              </label>
              <input
                id="send-url-store-number"
                type="text"
                value={storeNumber}
                onChange={(e) => setStoreNumber(sanitizeSingleLineInput(e.target.value))}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label
                htmlFor="send-url-po-number"
                style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--color-text)' }}
              >
                PO number
              </label>
              <input
                id="send-url-po-number"
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(sanitizeSingleLineInput(e.target.value))}
                style={inputStyle}
              />
            </div>

            {generatedUrl ? (
              <div
                style={{
                  marginTop: 'var(--space-6)',
                  padding: 'var(--space-4)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  wordBreak: 'break-all',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--color-text)' }}>Generated link</div>
                <code style={{ fontSize: '0.85rem', display: 'block', marginBottom: 'var(--space-4)' }}>{generatedUrl}</code>
                <button
                  type="button"
                  className="college-page-title-btn"
                  onClick={handleCopy}
                  style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '1rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {copyFeedback ? 'Copied!' : 'Copy link'}
                </button>
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted, #64748b)', marginTop: 'var(--space-4)', marginBottom: 0 }}>
                Search and select a school, then enter store name, store number, and PO number to generate a link.
              </p>
            )}
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
};

export default SendOrderUrlPage;
