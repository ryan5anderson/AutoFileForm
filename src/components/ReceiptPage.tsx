import React from 'react';
import { FormData, Category, ShirtVersion, ColorVersion } from '../types';
import { categories } from '../constants';
import { getProductName, getImagePath, getShirtVersionTotal, getVersionDisplayName, getRackToCardMapping, getRackDisplayName, hasColorVersions, getColorDisplayName } from '../utils';
import Header from './Header';
import Footer from './Footer';

interface ReceiptPageProps {
  formData: FormData;
  onBackToSummary: () => void;
  onExit: () => void;
}

const ReceiptPage: React.FC<ReceiptPageProps> = ({ formData, onBackToSummary, onExit }) => {
  // Generate auto-added cards based on rack selections
  const generateAutoAddedCards = () => {
    const rackToCardMapping = getRackToCardMapping();
    const autoAddedCards: { sku: string; name: string; qty: number }[] = [];

    // Find the rack category
    const rackCategory = categories.find(cat => cat.name === 'Rack');
    if (rackCategory) {
      rackCategory.images.forEach((img) => {
        const imagePath = getImagePath(rackCategory.path, img);
        const quantity = formData.quantities[imagePath] || '0';
        
        if (Number(quantity) > 0) {
          const cardMapping = rackToCardMapping[imagePath];
          if (cardMapping) {
            // Add the card for each quantity of the rack item
            for (let i = 0; i < Number(quantity); i++) {
              autoAddedCards.push({
                sku: cardMapping.sku,
                name: cardMapping.name,
                qty: 1
              });
            }
          }
        }
      });
    }

    // Group cards by SKU and sum quantities
    const groupedCards: Record<string, { sku: string; name: string; qty: number }> = {};
    autoAddedCards.forEach(card => {
      if (groupedCards[card.sku]) {
        groupedCards[card.sku].qty += card.qty;
      } else {
        groupedCards[card.sku] = { ...card };
      }
    });

    return Object.values(groupedCards);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const autoAddedCards = generateAutoAddedCards();

  return (
    <div style={{ 
      background: 'var(--color-bg)', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header />
      
      <main style={{
        flex: 1,
        padding: 'var(--space-4)',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%'
      }}>
        <h1 style={{ 
          color: 'var(--color-primary)', 
          marginBottom: 'var(--space-6)', 
          textAlign: 'center',
          fontSize: '2rem',
          fontWeight: '600'
        }}>
          Order Receipt
        </h1>
        
        <div style={{ 
          background: 'var(--color-bg)', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-lg)', 
          padding: 'var(--space-4)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            marginBottom: 'var(--space-4)',
            paddingBottom: 'var(--space-3)',
            borderBottom: '1px solid var(--color-border)'
          }}>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-2)'
            }}>
              <div><strong style={{ color: 'var(--color-text)' }}>Company:</strong> {formData.company}</div>
              <div><strong style={{ color: 'var(--color-text)' }}>Store Number:</strong> {formData.storeNumber}</div>
              <div><strong style={{ color: 'var(--color-text)' }}>Store Manager:</strong> {formData.storeManager}</div>
              <div><strong style={{ color: 'var(--color-text)' }}>Date:</strong> {formData.date}</div>
            </div>
          </div>
          
          {categories.map((category: Category) => (
            <div key={category.name} style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ 
                fontWeight: '600', 
                fontSize: '1.125rem',
                borderBottom: '2px solid var(--color-primary)', 
                marginBottom: 'var(--space-3)',
                paddingBottom: 'var(--space-2)',
                color: 'var(--color-primary)'
              }}>
                {category.name}
              </div>
              {category.images.map((img) => {
                const imagePath = getImagePath(category.path, img);
                const productName = category.name === 'Rack' ? getRackDisplayName(img) : getProductName(img);
                
                if (img === 'M100482538 SHHODC Hover DTF on Black or Forest .png') {
                  // Special case for shirt with both versions and colors
                  const shirtVersions = formData.shirtVersions?.[imagePath];
                  const colorVersions = formData.colorVersions?.[imagePath];
                  const totalShirtQty = getShirtVersionTotal(shirtVersions, category.shirtVersions);
                  const totalColorQty = Object.values(colorVersions || {}).reduce((sum, qty) => sum + Number(qty || 0), 0);
                  
                  if (totalShirtQty > 0 && totalColorQty > 0) {
                    return (
                      <div key={img} style={{ 
                        marginBottom: 'var(--space-3)',
                        padding: 'var(--space-3)',
                        background: 'var(--color-bg)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--color-border)'
                      }}>
                        <div style={{ 
                          fontWeight: '600', 
                          fontSize: '1rem',
                          marginBottom: 'var(--space-2)',
                          color: 'var(--color-text)'
                        }}>
                          {productName}
                        </div>
                        
                        {/* Shirt Versions */}
                        <div style={{ 
                          borderBottom: '1px solid var(--color-border)', 
                          paddingBottom: 'var(--space-2)', 
                          marginBottom: 'var(--space-2)' 
                        }}>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: '600',
                            color: 'var(--color-primary)',
                            marginBottom: 'var(--space-1)'
                          }}>
                            Shirt Versions:
                          </div>
                          {category.shirtVersions?.map((version) => {
                            const versionKey = version as keyof ShirtVersion;
                            const versionValue = shirtVersions?.[versionKey];
                            const displayName = getVersionDisplayName(version);
                            
                            if (versionValue && Number(versionValue) > 0) {
                              return (
                                <div key={version} style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  padding: 'var(--space-1) 0', 
                                  fontSize: '0.875rem', 
                                  marginLeft: 'var(--space-3)' 
                                }}>
                                  <span>{displayName}</span>
                                  <span style={{ fontWeight: '500' }}>Qty: {versionValue}</span>
                                </div>
                              );
                            }
                            return null;
                          })}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            padding: 'var(--space-1) 0', 
                            fontSize: '0.875rem', 
                            marginLeft: 'var(--space-3)', 
                            fontWeight: '600',
                            color: 'var(--color-primary)',
                            borderTop: '1px solid var(--color-border)',
                            marginTop: 'var(--space-2)',
                            paddingTop: 'var(--space-2)'
                          }}>
                            <span>Shirt Total</span>
                            <span>Qty: {totalShirtQty}</span>
                          </div>
                        </div>

                        {/* Color Versions */}
                        <div>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: '600',
                            color: 'var(--color-primary)',
                            marginBottom: 'var(--space-1)'
                          }}>
                            Colors:
                          </div>
                          {category.colorVersions?.map((color) => {
                            const colorKey = color as keyof ColorVersion;
                            const colorValue = colorVersions?.[colorKey];
                            const displayName = getColorDisplayName(color);
                            
                            if (colorValue && Number(colorValue) > 0) {
                              return (
                                <div key={color} style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  padding: 'var(--space-1) 0', 
                                  fontSize: '0.875rem', 
                                  marginLeft: 'var(--space-3)' 
                                }}>
                                  <span>{displayName}</span>
                                  <span style={{ fontWeight: '500' }}>Qty: {colorValue}</span>
                                </div>
                              );
                            }
                            return null;
                          })}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            padding: 'var(--space-1) 0', 
                            fontSize: '0.875rem', 
                            marginLeft: 'var(--space-3)', 
                            fontWeight: '600',
                            color: 'var(--color-primary)',
                            borderTop: '1px solid var(--color-border)',
                            marginTop: 'var(--space-2)',
                            paddingTop: 'var(--space-2)'
                          }}>
                            <span>Color Total</span>
                            <span>Qty: {totalColorQty}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null; // Don't show items with 0 quantity
                } else if (hasColorVersions(img)) {
                  const colorVersions = formData.colorVersions?.[imagePath];
                  const totalQty = Object.values(colorVersions || {}).reduce((sum, qty) => sum + Number(qty || 0), 0);
                  
                  if (totalQty > 0) {
                    return (
                      <div key={img} style={{ 
                        marginBottom: 'var(--space-3)',
                        padding: 'var(--space-3)',
                        background: 'var(--color-bg)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--color-border)'
                      }}>
                        <div style={{ 
                          fontWeight: '600', 
                          fontSize: '1rem',
                          marginBottom: 'var(--space-2)',
                          color: 'var(--color-text)'
                        }}>
                          {productName}
                        </div>
                        {category.colorVersions?.map((color) => {
                          const colorKey = color as keyof ColorVersion;
                          const colorValue = colorVersions?.[colorKey];
                          const displayName = getColorDisplayName(color);
                          
                          if (colorValue && Number(colorValue) > 0) {
                            return (
                              <div key={color} style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                padding: 'var(--space-1) 0', 
                                fontSize: '0.875rem', 
                                marginLeft: 'var(--space-3)' 
                              }}>
                                <span>{displayName}</span>
                                <span style={{ fontWeight: '500' }}>Qty: {colorValue}</span>
                              </div>
                            );
                          }
                          return null;
                        })}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          padding: 'var(--space-1) 0', 
                          fontSize: '0.875rem', 
                          marginLeft: 'var(--space-3)', 
                          fontWeight: '600',
                          color: 'var(--color-primary)',
                          borderTop: '1px solid var(--color-border)',
                          marginTop: 'var(--space-2)',
                          paddingTop: 'var(--space-2)'
                        }}>
                          <span>Total</span>
                          <span>Qty: {totalQty}</span>
                        </div>
                      </div>
                    );
                  }
                  return null; // Don't show items with 0 quantity
                } else if (category.hasShirtVersions && category.shirtVersions) {
                  const shirtVersions = formData.shirtVersions?.[imagePath];
                  const totalQty = getShirtVersionTotal(shirtVersions, category.shirtVersions);
                  
                  if (totalQty > 0) {
                    return (
                      <div key={img} style={{ 
                        marginBottom: 'var(--space-3)',
                        padding: 'var(--space-3)',
                        background: 'var(--color-bg)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--color-border)'
                      }}>
                        <div style={{ 
                          fontWeight: '600', 
                          fontSize: '1rem',
                          marginBottom: 'var(--space-2)',
                          color: 'var(--color-text)'
                        }}>
                          {productName}
                        </div>
                        {category.shirtVersions.map((version) => {
                          const versionKey = version as keyof ShirtVersion;
                          const versionValue = shirtVersions?.[versionKey];
                          const displayName = getVersionDisplayName(version);
                          
                          if (versionValue && Number(versionValue) > 0) {
                            return (
                              <div key={version} style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                padding: 'var(--space-1) 0', 
                                fontSize: '0.875rem', 
                                marginLeft: 'var(--space-3)' 
                              }}>
                                <span>{displayName}</span>
                                <span style={{ fontWeight: '500' }}>Qty: {versionValue}</span>
                              </div>
                            );
                          }
                          return null;
                        })}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          padding: 'var(--space-1) 0', 
                          fontSize: '0.875rem', 
                          marginLeft: 'var(--space-3)', 
                          fontWeight: '600',
                          color: 'var(--color-primary)',
                          borderTop: '1px solid var(--color-border)',
                          marginTop: 'var(--space-2)',
                          paddingTop: 'var(--space-2)'
                        }}>
                          <span>Total</span>
                          <span>Qty: {totalQty}</span>
                        </div>
                      </div>
                    );
                  }
                  return null; // Don't show items with 0 quantity
                } else {
                  const qty = formData.quantities[imagePath] || '0';
                  if (Number(qty) > 0) {
                    return (
                      <div key={img} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        padding: 'var(--space-2) 0', 
                        fontSize: '1rem',
                        borderBottom: '1px solid var(--color-border)'
                      }}>
                        <span style={{ fontWeight: '500' }}>{productName}</span>
                        <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>Qty: {qty}</span>
                      </div>
                    );
                  }
                  return null; // Don't show items with 0 quantity
                }
              })}
            </div>
          ))}

          {/* Auto-Added Cards Section */}
          {autoAddedCards.length > 0 && (
            <div style={{ 
              marginTop: 'var(--space-4)',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--color-border)'
            }}>
              <div style={{ 
                fontWeight: '600', 
                fontSize: '1.125rem',
                borderBottom: '2px solid var(--color-primary)', 
                marginBottom: 'var(--space-3)',
                paddingBottom: 'var(--space-2)',
                color: 'var(--color-primary)'
              }}>
                Auto-Added Cards
              </div>
              {autoAddedCards.map((card, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: 'var(--space-2) 0', 
                  fontSize: '1rem',
                  borderBottom: '1px solid var(--color-border)'
                }}>
                  <span style={{ fontWeight: '500' }}>{card.name}</span>
                  <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>Qty: {card.qty}</span>
                </div>
              ))}
            </div>
          )}

          {formData.orderNotes && (
            <div style={{ 
              marginTop: 'var(--space-4)',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--color-border)'
            }}>
              <div style={{ 
                fontWeight: '600', 
                fontSize: '1.125rem',
                borderBottom: '2px solid var(--color-primary)', 
                marginBottom: 'var(--space-3)',
                paddingBottom: 'var(--space-2)',
                color: 'var(--color-primary)'
              }}>
                Order Notes
              </div>
              <div style={{ 
                fontSize: '1rem',
                lineHeight: '1.6',
                color: 'var(--color-text)',
                whiteSpace: 'pre-wrap'
              }}>
                {formData.orderNotes}
              </div>
            </div>
          )}
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-6)',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={onBackToSummary}
            style={{
              background: 'var(--color-bg)',
              color: 'var(--color-primary)',
              padding: 'var(--space-3) var(--space-4)',
              border: '2px solid var(--color-primary)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            Back to Summary
          </button>
          
          <button
            type="button"
            onClick={onExit}
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              padding: 'var(--space-3) var(--space-4)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            Exit
          </button>

          <button
            type="button"
            onClick={handlePrintReceipt}
            style={{
              background: 'var(--color-success)',
              color: 'white',
              padding: 'var(--space-3) var(--space-4)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            Print Receipt
          </button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ReceiptPage; 