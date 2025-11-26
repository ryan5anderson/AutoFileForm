import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import '../../styles/college-pages.css';
import { fetchCollegeOrder, type OrderItem } from '../../services/collegeApiService';

const TestApiOrderPage: React.FC = () => {
  const { orderTemplateId } = useParams<{ orderTemplateId: string }>();
  const [orderData, setOrderData] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!orderTemplateId) {
        setError('No order template ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchCollegeOrder(orderTemplateId);
        setOrderData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order data');
        console.error('Error fetching order data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderTemplateId]);

  // Get proxy URL for image proxying (if needed)
  const PROXY_URL = process.env.REACT_APP_PROXY_URL || 'http://localhost:5000';
  
  const getProxiedImageUrl = (url: string | null | undefined): string | null => {
    if (!url || url.trim() === '') {
      return null;
    }
    
    const trimmedUrl = url.trim();
    
    // Fix malformed URLs (http: instead of http://)
    let fixedUrl = trimmedUrl;
    if (trimmedUrl.startsWith('http:') && !trimmedUrl.startsWith('http://')) {
      fixedUrl = trimmedUrl.replace('http:', 'http://');
    }
    
    // If it's already a data URL or blob URL, return as-is
    if (fixedUrl.startsWith('data:') || fixedUrl.startsWith('blob:')) {
      return fixedUrl;
    }
    
    // If it's from the same origin, no need to proxy
    try {
      const urlObj = new URL(fixedUrl);
      if (urlObj.origin === window.location.origin) {
        return fixedUrl;
      }
    } catch (e) {
      // Invalid URL, try to proxy it anyway
    }
    
    // Use proxy for external images
    const encodedUrl = encodeURIComponent(fixedUrl);
    return `${PROXY_URL}/api/proxy-image?url=${encodedUrl}`;
  };

  return (
    <div className="summary-page-container">
      <main className="summary-page-main" style={{ maxWidth: 1200, padding: 'var(--space-4)' }}>
        <h1 style={{ 
          color: 'var(--color-text)', 
          marginTop: 'var(--space-12)', 
          marginBottom: 'var(--space-4)' 
        }}>
          Order Data for Order Template: {orderTemplateId}
        </h1>

        {/* Loading State */}
        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-8)', 
            color: 'var(--color-text)' 
          }}>
            Loading order data...
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

        {/* Product Grid */}
        {!loading && !error && orderData.length > 0 && (
          <div className="product-grid" style={{ marginTop: 'var(--space-6)' }}>
            {orderData.map((item, index) => {
              const imageUrl = getProxiedImageUrl(item.productUrl);
              
              return (
                <div 
                  key={`${item.ORDER_NUM}-${item.ITEM_ID}-${index}`}
                  className="product-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)'
                  }}
                >
                  {imageUrl ? (
                    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                    <img
                      src={imageUrl}
                      alt={item.SHIRTNAME || 'Product image'}
                      style={{ 
                        width: '100%', 
                        borderRadius: 'var(--radius)', 
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid var(--color-border)',
                        objectFit: 'contain',
                        backgroundColor: 'var(--color-gray-50)',
                        minHeight: '200px'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      minHeight: '200px',
                      backgroundColor: 'var(--color-gray-100)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-gray-500)',
                      fontSize: 'var(--font-size-sm)'
                    }}>
                      No image available
                    </div>
                  )}
                  <div style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '500',
                    color: 'var(--color-text)',
                    textAlign: 'center',
                    padding: '0 var(--space-2)'
                  }}>
                    {item.SHIRTNAME || 'Unnamed Product'}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orderData.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-8)', 
            color: 'var(--color-gray-600)' 
          }}>
            No order data found for this order template.
          </div>
        )}
      </main>
    </div>
  );
};

export default TestApiOrderPage;

