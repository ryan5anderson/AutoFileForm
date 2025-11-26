import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import '../../styles/college-pages.css';
import { fetchColleges, checkProxyHealth, type CollegeData } from '../../services/collegeApiService';

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
  const [logoErrors, setLogoErrors] = useState<Map<string, LogoError>>(new Map());

  // Get proxy URL from environment or use default
  const PROXY_URL = process.env.REACT_APP_PROXY_URL || 'http://localhost:5000';

  // Convert image URL to use proxy (to bypass CORS)
  const getProxiedImageUrl = (url: string | null | undefined): string | null => {
    if (!url || url.trim() === '') {
      return null;
    }
    
    const trimmedUrl = url.trim();
    
    // If it's already a data URL or blob URL, return as-is
    if (trimmedUrl.startsWith('data:') || trimmedUrl.startsWith('blob:')) {
      return trimmedUrl;
    }
    
    // If it's from the same origin, no need to proxy
    try {
      const urlObj = new URL(trimmedUrl);
      if (urlObj.origin === window.location.origin) {
        return trimmedUrl;
      }
    } catch (e) {
      // Invalid URL, try to proxy it anyway
    }
    
    // Use proxy for external images
    const encodedUrl = encodeURIComponent(trimmedUrl);
    return `${PROXY_URL}/api/proxy-image?url=${encodedUrl}`;
  };

  // Fetch API Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First check if proxy server is running
        const isProxyHealthy = await checkProxyHealth();
        if (!isProxyHealthy) {
          throw new Error(
            'Proxy server is not responding. Please:\n' +
            '1. Open a terminal in the "server" folder\n' +
            '2. Run "npm install" (first time only)\n' +
            '3. Run "npm start" to start the proxy server'
          );
        }
        
        const data = await fetchColleges();
        setColleges(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
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
    
    // Log detailed error to console
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
    
    // Store error in state
    setLogoErrors(prev => {
      const newMap = new Map(prev);
      newMap.set(college.school_ID, {
        schoolId: college.school_ID,
        schoolName: college.schoolName,
        logoUrl: originalUrl,
        error: errorMessage
      });
      return newMap;
    });
    
    // Replace with error placeholder
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZmY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==';
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
    console.log(`Logo loaded successfully for ${college.schoolName}:`, college.logoUrl);
  };

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
            {error}
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
            {colleges.map((college) => (
              <button
                key={college.school_ID}
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
                  gap: 'var(--space-4)'
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
                onClick={() => {
                  navigate(`/test-api/${college.orderNumTemplate}`);
                }}
              >
                {(() => {
                  const proxiedUrl = getProxiedImageUrl(college.logoUrl);
                  return college.logoUrl ? (
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                      <img
                        src={proxiedUrl || college.logoUrl}
                        alt={`${college.schoolName} logo`}
                        style={{
                          width: '60px',
                          height: '60px',
                          minWidth: '60px',
                          minHeight: '60px',
                          objectFit: 'contain',
                          borderRadius: 'var(--radius)',
                          backgroundColor: 'var(--color-gray-50)',
                          border: logoErrors.has(college.school_ID) 
                            ? '2px solid var(--color-danger)' 
                            : '1px solid var(--color-border)',
                          padding: 'var(--space-1)'
                        }}
                        onError={(e) => handleImageError(e, college)}
                        onLoad={() => handleImageLoad(college)}
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
                          cursor: 'help'
                        }} title={logoErrors.get(college.school_ID)?.error}>
                          !
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      width: '60px',
                      height: '60px',
                      minWidth: '60px',
                      minHeight: '60px',
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
                      flexShrink: 0
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
                  flex: 1
                }}>
                  {college.schoolName}
                </h2>
              </button>
            ))}
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
