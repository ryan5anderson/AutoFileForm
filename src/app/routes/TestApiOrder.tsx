import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import '../../styles/college-pages.css';
import { fetchCollegeOrder, getProxiedImageUrl, type OrderItem } from '../../services/collegeApiService';
import Header from '../layout/Header';

// Type for tracking ORDERED fields per product
type OrderedFields = {
  ORDERED1: string;
  ORDERED2: string;
  ORDERED3: string;
  ORDERED4: string;
  ORDERED5: string;
};

const TestApiOrderPage: React.FC = () => {
  const { orderTemplateId } = useParams<{ orderTemplateId: string }>();
  const [orderData, setOrderData] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 24; // Show 24 items per page (good for 3-4 column grid)
  
  // State to track ORDERED fields for each product (keyed by item index or Expr1)
  const [orderedFields, setOrderedFields] = useState<Map<string, OrderedFields>>(new Map());
  
  // State for showing JSON output
  const [showJsonOutput, setShowJsonOutput] = useState<boolean>(false);

  // Get unique key for an item
  const getItemKey = (item: OrderItem, index: number): string => {
    return item.Expr1 || `${item.ORDER_NUM}-${item.DESIGN_NUM}-${item.ITEM_ID}-${index}`;
  };

  // Initialize ORDERED fields to "0" for all items
  const initializeOrderedFields = (items: OrderItem[]) => {
    const newMap = new Map<string, OrderedFields>();
    items.forEach((item, index) => {
      const key = getItemKey(item, index);
      newMap.set(key, {
        ORDERED1: '0',
        ORDERED2: '0',
        ORDERED3: '0',
        ORDERED4: '0',
        ORDERED5: '0'
      });
    });
    setOrderedFields(newMap);
  };

  // Update ORDERED field for a specific item
  const updateOrderedField = (itemKey: string, fieldName: keyof OrderedFields, value: string) => {
    setOrderedFields(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(itemKey) || {
        ORDERED1: '0',
        ORDERED2: '0',
        ORDERED3: '0',
        ORDERED4: '0',
        ORDERED5: '0'
      };
      newMap.set(itemKey, {
        ...current,
        [fieldName]: value
      });
      return newMap;
    });
  };

  // Calculate total items across all products
  const calculateTotalItems = (): number => {
    let total = 0;
    orderedFields.forEach(fields => {
      total += parseInt(fields.ORDERED1) || 0;
      total += parseInt(fields.ORDERED2) || 0;
      total += parseInt(fields.ORDERED3) || 0;
      total += parseInt(fields.ORDERED4) || 0;
      total += parseInt(fields.ORDERED5) || 0;
    });
    return total;
  };

  // Check if product has any quantities > 0
  const hasAnyQuantity = (itemKey: string): boolean => {
    const fields = orderedFields.get(itemKey);
    if (!fields) return false;
    return (
      (parseInt(fields.ORDERED1) || 0) > 0 ||
      (parseInt(fields.ORDERED2) || 0) > 0 ||
      (parseInt(fields.ORDERED3) || 0) > 0 ||
      (parseInt(fields.ORDERED4) || 0) > 0 ||
      (parseInt(fields.ORDERED5) || 0) > 0
    );
  };

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
        
        // Ensure data is an array before filtering
        if (!Array.isArray(data)) {
          console.error('Expected array but received:', typeof data, data);
          setError(`Invalid data format: expected array but received ${typeof data}`);
          return;
        }
        
        // Filter out ORDER REVIEW items
        const filteredData = data.filter(item => 
          item.SHIRTNAME && !item.SHIRTNAME.trim().toUpperCase().includes('ORDER REVIEW')
        );
        setOrderData(filteredData);
        // Initialize all ORDERED fields to "0"
        initializeOrderedFields(filteredData);
        setCurrentPage(1); // Reset to first page when new data loads
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order data');
        console.error('Error fetching order data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderTemplateId]);

  // Generate final JSON with updated ORDERED fields
  const generateOrderJson = (): string => {
    const updatedData = orderData.map((item, index) => {
      const itemKey = getItemKey(item, index);
      const ordered = orderedFields.get(itemKey) || {
        ORDERED1: '0',
        ORDERED2: '0',
        ORDERED3: '0',
        ORDERED4: '0',
        ORDERED5: '0'
      };
      return {
        ...item,
        ...ordered
      };
    });
    return JSON.stringify(updatedData, null, 2);
  };

  const totalItems = useMemo(() => calculateTotalItems(), [orderedFields]);


  return (
    <div className="summary-page-container">
      <Header showSidebarToggle={false} />
      <main className="summary-page-main" style={{ maxWidth: 1200, padding: 'var(--space-4)', marginTop: '64px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: 'var(--space-4)',
          marginBottom: 'var(--space-4)',
          flexWrap: 'wrap',
          gap: 'var(--space-2)'
        }}>
          <h1 style={{ 
            color: 'var(--color-text)', 
            margin: 0
          }}>
            Order Data for Order Template: {orderTemplateId}
          </h1>
          {/* Cart icon with total items */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-3)',
            backgroundColor: totalItems > 0 ? 'var(--color-primary, #2563eb)' : 'var(--color-gray-300)',
            borderRadius: 'var(--radius-lg)',
            color: 'white',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)'
          }}>
            <span style={{ fontSize: '20px' }}>🛒</span>
            <span>Total Items: {totalItems}</span>
          </div>
        </div>

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

        {/* Product Grid with Pagination */}
        {!loading && !error && orderData.length > 0 && (
          <>
            {/* Pagination Info */}
            <div style={{
              marginTop: 'var(--space-6)',
              marginBottom: 'var(--space-4)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-2)'
            }}>
              <div style={{
                color: 'var(--color-text)',
                fontSize: 'var(--font-size-sm)'
              }}>
                Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, orderData.length)} of {orderData.length} products
              </div>
              {orderData.length > itemsPerPage && (
                <div style={{
                  display: 'flex',
                  gap: 'var(--space-2)',
                  alignItems: 'center'
                }}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius)',
                      backgroundColor: currentPage === 1 ? 'var(--color-gray-100)' : 'var(--color-bg)',
                      color: currentPage === 1 ? 'var(--color-gray-400)' : 'var(--color-text)',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    Previous
                  </button>
                  <span style={{
                    color: 'var(--color-text)',
                    fontSize: 'var(--font-size-sm)',
                    padding: '0 var(--space-2)'
                  }}>
                    Page {currentPage} of {Math.ceil(orderData.length / itemsPerPage)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(orderData.length / itemsPerPage), prev + 1))}
                    disabled={currentPage >= Math.ceil(orderData.length / itemsPerPage)}
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius)',
                      backgroundColor: currentPage >= Math.ceil(orderData.length / itemsPerPage) ? 'var(--color-gray-100)' : 'var(--color-bg)',
                      color: currentPage >= Math.ceil(orderData.length / itemsPerPage) ? 'var(--color-gray-400)' : 'var(--color-text)',
                      cursor: currentPage >= Math.ceil(orderData.length / itemsPerPage) ? 'not-allowed' : 'pointer',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Product Grid */}
            <div className="product-grid" style={{ marginTop: 'var(--space-2)' }}>
              {orderData
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((item, localIndex) => {
                  const imageUrl = getProxiedImageUrl(item.productUrl);
                  const globalIndex = (currentPage - 1) * itemsPerPage + localIndex;
                  // Use the original index from the full array for consistency
                  const originalIndex = orderData.findIndex(origItem => 
                    origItem.Expr1 === item.Expr1 && 
                    origItem.ORDER_NUM === item.ORDER_NUM && 
                    origItem.DESIGN_NUM === item.DESIGN_NUM &&
                    origItem.ITEM_ID === item.ITEM_ID
                  );
                  const itemIndex = originalIndex >= 0 ? originalIndex : globalIndex;
                  const itemKey = getItemKey(item, itemIndex);
                  const ordered = orderedFields.get(itemKey) || {
                    ORDERED1: '0',
                    ORDERED2: '0',
                    ORDERED3: '0',
                    ORDERED4: '0',
                    ORDERED5: '0'
                  };
                  const hasQuantity = hasAnyQuantity(itemKey);
                  
                  // Get available sizes (size1-5 that have values)
                  const sizes = [
                    { key: 'size1' as const, orderedKey: 'ORDERED1' as const, label: item.size1, value: ordered.ORDERED1 },
                    { key: 'size2' as const, orderedKey: 'ORDERED2' as const, label: item.size2, value: ordered.ORDERED2 },
                    { key: 'size3' as const, orderedKey: 'ORDERED3' as const, label: item.size3, value: ordered.ORDERED3 },
                    { key: 'size4' as const, orderedKey: 'ORDERED4' as const, label: item.size4, value: ordered.ORDERED4 },
                    { key: 'size5' as const, orderedKey: 'ORDERED5' as const, label: item.size5, value: ordered.ORDERED5 },
                  ].filter(size => size.label && size.label.trim() !== '');
                  
                  return (
                    <div 
                      key={`${item.ORDER_NUM}-${item.ITEM_ID}-${globalIndex}`}
                      className="product-card"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-2)',
                        position: 'relative'
                      }}
                    >
                      {/* Cart icon */}
                      {hasQuantity && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            zIndex: 20,
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#2563eb',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            pointerEvents: 'none',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                        >
                          🛒
                        </div>
                      )}
                      
                      {/* Product Image */}
                      <div style={{ position: 'relative' }}>
                        {imageUrl ? (
                          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                          <img
                            src={imageUrl}
                            alt={item.SHIRTNAME || 'Product image'}
                            loading="lazy"
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
                      </div>
                      
                      {/* Product Name */}
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '500',
                        color: 'var(--color-text)',
                        textAlign: 'center',
                        padding: '0 var(--space-2)'
                      }}>
                        {item.SHIRTNAME || 'Unnamed Product'}
                      </div>
                      
                      {/* Description */}
                      {item.DESCRIPT && (
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: 'var(--color-gray-600)',
                          textAlign: 'center',
                          padding: '0 var(--space-2)',
                          marginTop: 'var(--space-1)'
                        }}>
                          {item.DESCRIPT.trim()}
                        </div>
                      )}
                      
                      {/* Size Quantity Inputs */}
                      {sizes.length > 0 && (
                        <div style={{
                          padding: 'var(--space-2)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 'var(--space-2)',
                          borderTop: '1px solid var(--color-border)',
                          marginTop: 'var(--space-1)'
                        }}>
                          <div style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: 'var(--color-text)',
                            marginBottom: 'var(--space-1)'
                          }}>
                            Quantities:
                          </div>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: sizes.length <= 3 ? `repeat(${sizes.length}, 1fr)` : 'repeat(3, 1fr)',
                            gap: 'var(--space-4)'
                          }}>
                            {sizes.map((size) => (
                              <div key={size.key} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                                <label style={{
                                  fontSize: '0.7rem',
                                  fontWeight: '500',
                                  color: 'var(--color-text)',
                                  textAlign: 'center'
                                }}>
                                  {size.label}
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={size.value}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    // Allow empty string temporarily for editing, but store as "0" if empty
                                    updateOrderedField(itemKey, size.orderedKey, val === '' ? '0' : val);
                                  }}
                                  onBlur={(e) => {
                                    // Ensure value is at least 0 when field loses focus
                                    const val = parseInt(e.target.value) || 0;
                                    updateOrderedField(itemKey, size.orderedKey, String(Math.max(0, val)));
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: 'var(--space-1)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius)',
                                    fontSize: '0.875rem',
                                    textAlign: 'center'
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => e.stopPropagation()}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Pagination Controls at Bottom */}
            {orderData.length > itemsPerPage && (
              <div style={{
                marginTop: 'var(--space-6)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                    backgroundColor: currentPage === 1 ? 'var(--color-gray-100)' : 'var(--color-bg)',
                    color: currentPage === 1 ? 'var(--color-gray-400)' : 'var(--color-text)',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  Previous
                </button>
                <span style={{
                  color: 'var(--color-text)',
                  fontSize: 'var(--font-size-sm)',
                  padding: '0 var(--space-2)'
                }}>
                  Page {currentPage} of {Math.ceil(orderData.length / itemsPerPage)}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(orderData.length / itemsPerPage), prev + 1))}
                  disabled={currentPage >= Math.ceil(orderData.length / itemsPerPage)}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                    backgroundColor: currentPage >= Math.ceil(orderData.length / itemsPerPage) ? 'var(--color-gray-100)' : 'var(--color-bg)',
                    color: currentPage >= Math.ceil(orderData.length / itemsPerPage) ? 'var(--color-gray-400)' : 'var(--color-text)',
                    cursor: currentPage >= Math.ceil(orderData.length / itemsPerPage) ? 'not-allowed' : 'pointer',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  Next
                </button>
              </div>
            )}

            {/* Submit Button */}
            <div style={{
              marginTop: 'var(--space-8)',
              padding: 'var(--space-6)',
              borderTop: '2px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              alignItems: 'center'
            }}>
              <button
                type="button"
                onClick={() => setShowJsonOutput(!showJsonOutput)}
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  backgroundColor: 'var(--color-primary, #2563eb)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary, #2563eb)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                {showJsonOutput ? 'Hide Order JSON' : 'View Order JSON'}
              </button>

              {/* JSON Output */}
              {showJsonOutput && (
                <div style={{
                  width: '100%',
                  maxWidth: '1000px',
                  backgroundColor: 'var(--color-gray-50)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  position: 'relative'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-3)'
                  }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text)'
                    }}>
                      Order JSON Output
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generateOrderJson());
                        alert('JSON copied to clipboard!');
                      }}
                      style={{
                        padding: 'var(--space-1) var(--space-3)',
                        backgroundColor: 'var(--color-gray-200)',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius)',
                        fontSize: 'var(--font-size-sm)',
                        cursor: 'pointer'
                      }}
                    >
                      Copy JSON
                    </button>
                  </div>
                  <pre style={{
                    margin: 0,
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                    overflow: 'auto',
                    maxHeight: '600px',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    color: 'var(--color-text)',
                    fontFamily: 'monospace'
                  }}>
                    {generateOrderJson()}
                  </pre>
                </div>
              )}
            </div>
          </>
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

