import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import '../../styles/college-pages.css';
import { fetchColleges, getProxiedImageUrl, checkApiHealth, type CollegeData, type ApiErrorInfo } from '../../services/collegeApiService';

interface LogoError {
  schoolId: string;
  schoolName: string;
  logoUrl: string;
  error: string;
}

const TestApiPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State Management
  const [colleges, setColleges] = useState<CollegeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<ApiErrorInfo | null>(null);
  const [logoErrors, setLogoErrors] = useState<Map<string, LogoError>>(new Map());
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');


  // Fetch API Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setErrorDetails(null);
        setShowDebugInfo(false);
        
        // Check if API is responding
        const healthCheck = await checkApiHealth();
        if (!healthCheck.healthy) {
          setError('API is not responding. Please check your connection.');
          setErrorDetails(healthCheck.error || {
            message: 'Unknown error during health check',
            url: '/api/health',
          });
          setShowDebugInfo(true);
          return;
        }
        
        const data = await fetchColleges();
        setColleges(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        
        // Extract API error details if available
        if (err && typeof err === 'object' && 'apiError' in err) {
          setErrorDetails(err.apiError as ApiErrorInfo);
        } else {
          setErrorDetails({
            message: errorMessage,
            error: errorMessage,
          });
        }
        setShowDebugInfo(true);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle logo image error with detailed error tracking
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, college: CollegeData) => {
    const target = e.target as HTMLImageElement;
    const img = target as HTMLImageElement;
    
    // Prevent infinite loop: if we've already set the error placeholder, don't try again
    const errorPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZmY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==';
    if (img.src === errorPlaceholder || logoErrors.has(college.school_ID)) {
      // Already handled this error, prevent re-triggering
      return;
    }
    
    const originalUrl = college.logoUrl || 'No URL provided';
    const proxiedUrl = getProxiedImageUrl(college.logoUrl);
    const isUsingProxy = proxiedUrl && img.src.includes('/api/proxy-image');
    
    // Determine error type
    let errorMessage = 'Image failed to load';
    
    // Check for common error scenarios
    if (!originalUrl || originalUrl === 'No URL provided') {
      errorMessage = 'No logo URL provided';
    } else if (isUsingProxy) {
      errorMessage = `Failed to load image through proxy. The proxy server may be unable to fetch the image from: ${originalUrl}. Check if the image URL is accessible.`;
    } else if (originalUrl.startsWith('http://') && window.location.protocol === 'https:') {
      errorMessage = 'Mixed content blocked (HTTP on HTTPS page). Image should be proxied automatically.';
    } else if (img.src.startsWith(window.location.origin) && !img.src.includes('/api/proxy-image')) {
      errorMessage = `URL was treated as relative path: "${originalUrl}"`;
    } else {
      errorMessage = `Failed to load image from: ${originalUrl}`;
    }
    
    // Log detailed error to console (only once)
    console.error(`Logo load error for ${college.schoolName}:`, {
      schoolId: college.school_ID,
      originalUrl: originalUrl,
      proxiedUrl: proxiedUrl,
      isUsingProxy: isUsingProxy,
      error: errorMessage,
      currentProtocol: window.location.protocol,
      imageSrc: img.src,
      isRelative: img.src.startsWith(window.location.origin) && !img.src.includes('/api/proxy-image')
    });
    
    // Store error in state (this will trigger a re-render, but we've already checked for duplicates)
    setLogoErrors(prev => {
      // Don't update if already exists to prevent unnecessary re-renders
      if (prev.has(college.school_ID)) {
        return prev;
      }
      const newMap = new Map(prev);
      newMap.set(college.school_ID, {
        schoolId: college.school_ID,
        schoolName: college.schoolName,
        logoUrl: originalUrl,
        error: errorMessage
      });
      return newMap;
    });
    
    // Replace with error placeholder and remove error handler to prevent loop
    target.onerror = null; // Remove error handler to prevent infinite loop
    target.src = errorPlaceholder;
    target.alt = `Logo error: ${errorMessage}`;
  };
  
  // Handle successful image load
  const handleImageLoad = (college: CollegeData) => {
    // Remove error if image loads successfully
    setLogoErrors(prev => {
      const newMap = new Map(prev);
      newMap.delete(college.school_ID);
      return newMap;
    });
  };

  // Deduplicate colleges and filter based on search query
  const filteredColleges = useMemo(() => {
    // First, deduplicate colleges by school_ID (keep first occurrence)
    const seen = new Set<string>();
    const uniqueColleges = colleges.filter((college) => {
      if (seen.has(college.school_ID)) {
        console.log(`Duplicate college filtered out: ${college.schoolName} (ID: ${college.school_ID})`);
        return false;
      }
      seen.add(college.school_ID);
      return true;
    });

    // Then filter by search query if present
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      return uniqueColleges;
    }
    
    const filtered = uniqueColleges.filter((college) => 
      college.schoolName.toLowerCase().includes(trimmedQuery.toLowerCase())
    );
    
    console.log(`Search query: "${trimmedQuery}", Found ${filtered.length} colleges out of ${uniqueColleges.length}`);
    
    return filtered;
  }, [colleges, searchQuery]);

  // Determine if we should show "no results" message
  const showNoResults = useMemo(() => {
    const trimmedQuery = searchQuery.trim();
    return trimmedQuery.length > 0 && filteredColleges.length === 0;
  }, [searchQuery, filteredColleges]);

  return (
    <div className="summary-page-container">
      <main className="summary-page-main" style={{ maxWidth: 1200, padding: 'var(--space-4)' }}>
        <h1 style={{ color: 'var(--color-text)', marginTop: 'var(--space-12)', marginBottom: 'var(--space-4)' }}>
          Pick a school
        </h1>

        {/* Loading State */}
        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-8)', 
            color: 'var(--color-text)' 
          }}>
            Loading colleges...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ 
            padding: 'var(--space-4)', 
            backgroundColor: 'var(--color-gray-50)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius)',
            color: 'var(--color-danger)',
            marginBottom: 'var(--space-4)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: errorDetails ? 'var(--space-2)' : 0
            }}>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 'var(--font-size-lg)', display: 'block', marginBottom: 'var(--space-2)' }}>
                  ⚠️ Error: {error}
                </strong>
              </div>
              {errorDetails && (
                <button
                  onClick={() => setShowDebugInfo(!showDebugInfo)}
                  style={{
                    padding: 'var(--space-1) var(--space-2)',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--color-danger)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--color-danger)',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-sm)',
                    marginLeft: 'var(--space-2)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {showDebugInfo ? 'Hide' : 'Show'} Debug Info
                </button>
              )}
            </div>
            
            {showDebugInfo && errorDetails && (
              <div style={{
                marginTop: 'var(--space-4)',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                fontFamily: 'monospace',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text)',
                maxHeight: '400px',
                overflow: 'auto'
              }}>
                <div style={{ marginBottom: 'var(--space-2)', fontWeight: 'bold', color: 'var(--color-danger)' }}>
                  Debug Information:
                </div>
                
                {errorDetails.url && (
                  <div style={{ marginBottom: 'var(--space-2)' }}>
                    <strong>API URL:</strong> <span style={{ color: 'var(--color-gray-700)' }}>{errorDetails.url}</span>
                  </div>
                )}
                
                {errorDetails.status !== undefined && (
                  <div style={{ marginBottom: 'var(--space-2)' }}>
                    <strong>Status Code:</strong> <span style={{ color: 'var(--color-gray-700)' }}>{errorDetails.status}</span>
                    {errorDetails.statusText && (
                      <span style={{ color: 'var(--color-gray-700)', marginLeft: 'var(--space-1)' }}>
                        ({errorDetails.statusText})
                      </span>
                    )}
                  </div>
                )}
                
                {errorDetails.message && (
                  <div style={{ marginBottom: 'var(--space-2)' }}>
                    <strong>Error Message:</strong> <span style={{ color: 'var(--color-gray-700)' }}>{errorDetails.message}</span>
                  </div>
                )}
                
                {errorDetails.error && (
                  <div style={{ marginBottom: 'var(--space-2)' }}>
                    <strong>Error Details:</strong> <span style={{ color: 'var(--color-gray-700)' }}>{errorDetails.error}</span>
                  </div>
                )}
                
                {errorDetails.responseText && (
                  <div style={{ marginBottom: 'var(--space-2)' }}>
                    <strong>Response Body:</strong>
                    <pre style={{
                      marginTop: 'var(--space-1)',
                      padding: 'var(--space-2)',
                      backgroundColor: 'var(--color-gray-100)',
                      borderRadius: 'var(--radius)',
                      overflow: 'auto',
                      maxHeight: '200px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontSize: '0.85em'
                    }}>
                      {errorDetails.responseText}
                    </pre>
                  </div>
                )}
                
                <div style={{ 
                  marginTop: 'var(--space-3)', 
                  paddingTop: 'var(--space-2)',
                  borderTop: '1px solid var(--color-border)',
                  fontSize: '0.85em',
                  color: 'var(--color-gray-600)'
                }}>
                  <strong>Environment:</strong>
                  <ul style={{ margin: 'var(--space-1) 0', paddingLeft: 'var(--space-4)' }}>
                    <li>Current URL: {window.location.href}</li>
                    <li>API Base URL: {process.env.REACT_APP_API_BASE_URL || '/api'}</li>
                    <li>Protocol: {window.location.protocol}</li>
                    <li>Host: {window.location.host}</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Logo Error Summary */}
        {!loading && !error && colleges.length > 0 && logoErrors.size > 0 && (
          <div style={{ 
            padding: 'var(--space-3)', 
            backgroundColor: 'var(--color-warning-light, #fff3cd)',
            border: '1px solid var(--color-warning, #ffc107)',
            borderRadius: 'var(--radius)',
            color: 'var(--color-warning-dark, #856404)',
            marginBottom: 'var(--space-4)'
          }}>
            <strong>⚠️ Logo Loading Issues:</strong> {logoErrors.size} out of {colleges.length} logos failed to load. 
            Check individual cards below for details. See browser console for more information.
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && colleges.length === 0 && (
          <div style={{
            marginTop: 'var(--space-6)',
            padding: 'var(--space-6)',
            textAlign: 'center',
            color: 'var(--color-gray-600)'
          }}>
            <p>No colleges found.</p>
            <p style={{ fontSize: '0.9em', marginTop: 'var(--space-2)' }}>
              The API returned an empty list. Check the browser console for details.
            </p>
          </div>
        )}

        {/* Success State - College List */}
        {!loading && !error && colleges.length > 0 && (
          <div 
            style={{
              marginTop: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              maxWidth: '800px'
            }}
          >
            {/* Search Bar */}
            <div
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-bg)',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-2)'
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flexShrink: 0, color: 'var(--color-gray-600)' }}
              >
                <path
                  d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 19L14.65 14.65"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                key="college-search-input"
                type="text"
                placeholder="Search colleges..."
                value={searchQuery}
                onChange={(e) => {
                  e.preventDefault();
                  setSearchQuery(e.target.value);
                }}
                onKeyDown={(e) => {
                  // Prevent any key handlers from interfering
                  e.stopPropagation();
                }}
                autoComplete="off"
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text)',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Show "no results" message if search has no matches */}
            {showNoResults ? (
              <div style={{
                padding: 'var(--space-6)',
                textAlign: 'center',
                color: 'var(--color-gray-600)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-bg)',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}>
                No colleges found matching "{searchQuery.trim()}"
              </div>
            ) : (
              <>
                {filteredColleges.map((college, index) => (
              <button
                key={`${college.school_ID}-${college.orderNumTemplate || index}`}
                type="button"
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-bg)',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  position: 'relative',
                  zIndex: 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                aria-label={`View details for ${college.schoolName}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/test-api/${college.orderNumTemplate}`);
                }}
              >
                {(() => {
                  const proxiedUrl = getProxiedImageUrl(college.logoUrl);
                  // Log college name and logo URL from mytownoriginals.com
                  if (college.logoUrl && college.logoUrl.includes('mytownoriginals.com')) {
                    console.log(`College: ${college.schoolName} | Logo URL: ${college.logoUrl}`);
                  }
                  const hasError = logoErrors.has(college.school_ID);
                  const errorPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZmY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==';
                  
                  return college.logoUrl ? (
                    <div style={{ position: 'relative', flexShrink: 0, pointerEvents: 'none' }}>
                      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                      <img
                        src={hasError ? errorPlaceholder : (proxiedUrl || college.logoUrl)}
                        alt={hasError ? `Logo error for ${college.schoolName}` : `${college.schoolName} logo`}
                        style={{
                          width: '80px',
                          height: '80px',
                          minWidth: '80px',
                          minHeight: '80px',
                          objectFit: 'contain',
                          borderRadius: 'var(--radius)',
                          backgroundColor: 'var(--color-gray-50)',
                          border: hasError 
                            ? '2px solid var(--color-danger)' 
                            : '1px solid var(--color-border)',
                          padding: 'var(--space-1)',
                          pointerEvents: 'none'
                        }}
                        onError={hasError ? undefined : (e) => handleImageError(e, college)}
                        onLoad={hasError ? undefined : () => handleImageLoad(college)}
                        loading="lazy"
                      />
                      {logoErrors.has(college.school_ID) && (
                        <div style={{
                          position: 'absolute',
                          top: '-2px',
                          right: '-2px',
                          backgroundColor: 'var(--color-danger)',
                          color: 'white',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          cursor: 'help',
                          pointerEvents: 'auto'
                        }} title={logoErrors.get(college.school_ID)?.error}>
                          !
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      width: '80px',
                      height: '80px',
                      minWidth: '80px',
                      minHeight: '80px',
                      backgroundColor: 'var(--color-gray-100)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-gray-500)',
                      textAlign: 'center',
                      padding: 'var(--space-1)',
                      flexShrink: 0,
                      pointerEvents: 'none'
                    }}>
                      No Logo
                    </div>
                  );
                })()}
                <h2 style={{
                  margin: 0,
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text)',
                  flex: 1,
                  pointerEvents: 'none'
                }}>
                  {college.schoolName}
                </h2>
              </button>
                ))}
              </>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && colleges.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-8)', 
            color: 'var(--color-gray-600)' 
          }}>
            No colleges found.
          </div>
        )}
      </main>
    </div>
  );
};

export default TestApiPage;
