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
    const rackCategory = categories.find(cat => cat.name === 'Display Options');
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
          
          {categories.filter(category => {
            // Check if any image in the category has a nonzero quantity or selection
            return category.images.some(img => {
              const imagePath = getImagePath(category.path, img);
              // Tie-dye
              const tieDyeImages = [
                'M100965414 SHOUDC OU Go Green DTF on Forest.png',
                'M100482538 SHHODC Hover DTF on Black or Forest .png',
                'M100437896 SHOUDC Over Under DTF on Forest.png',
              ];
              if (tieDyeImages.includes(img)) {
                const comboVersions = formData.shirtColorComboVersions?.[imagePath];
                if (comboVersions) {
                  for (const value of Object.values(comboVersions)) {
                    if (value && Number(value) > 0) return true;
                  }
                }
              }
              // Display Options
              if (category.hasDisplayOptions) {
                const displayOption = formData.displayOptions?.[imagePath];
                if ((displayOption && (Number(displayOption.displayOnly) > 0 || Number(displayOption.displayStandardCasePack) > 0))) return true;
              }
              // Sweatpants/Joggers
              if (category.name === 'Sweatpants/Joggers' && formData.sweatpantJoggerOptions) {
                const sj = formData.sweatpantJoggerOptions[imagePath];
                if (sj && Object.values(sj).some(val => Number(val) > 0)) return true;
              }
              // Color Versions
              if (hasColorVersions(img)) {
                const colorVersions = formData.colorVersions?.[imagePath];
                if (colorVersions && Object.values(colorVersions).some(val => Number(val) > 0)) return true;
              }
              // Shirt Versions
              if (category.hasShirtVersions && category.shirtVersions) {
                const shirtVersions = formData.shirtVersions?.[imagePath];
                if (shirtVersions && Object.values(shirtVersions).some(val => Number(val) > 0)) return true;
              }
              // Simple quantity
              if (Number(formData.quantities[imagePath] || 0) > 0) return true;
              return false;
            });
          }).map((category: Category) => (
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
                const productName = category.name === 'Display Options' ? getRackDisplayName(img) : getProductName(img);
                // --- BEGIN TIE-DYE FIRST ---
                const tieDyeImages = [
                  'M100965414 SHOUDC OU Go Green DTF on Forest.png',
                  'M100482538 SHHODC Hover DTF on Black or Forest .png',
                  'M100437896 SHOUDC Over Under DTF on Forest.png',
                ];
                if (tieDyeImages.includes(img)) {
                  const comboVersions = formData.shirtColorComboVersions?.[imagePath];
                  const categoryShirtVersions = category.shirtVersions || ['tshirt', 'longsleeve', 'hoodie'];
                  const categoryColors = category.colorVersions || ['black', 'forest'];
                  let totalQty = 0;
                  const rows = [];
                  for (const version of categoryShirtVersions) {
                    for (const color of categoryColors) {
                      const comboKey = `${version}_${color}`;
                      const value = comboVersions?.[comboKey];
                      if (value && Number(value) > 0) {
                        totalQty += Number(value);
                        rows.push(
                          <div key={comboKey} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginLeft: 'var(--space-3)', padding: 'var(--space-1) 0' }}>
                            <span>{getVersionDisplayName(version, img)} {getColorDisplayName(color)}</span>
                            <span style={{ fontWeight: '500' }}>Qty: {value}</span>
                          </div>
                        );
                      }
                    }
                  }
                  if (totalQty > 0) {
                    return (
                      <div key={img} style={{
                        marginBottom: 'var(--space-3)',
                        padding: 'var(--space-3)',
                        background: 'var(--color-bg)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--color-border)'
                      }}>
                        <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: 'var(--space-2)', color: 'var(--color-text)' }}>{productName}</div>
                        {rows}
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
                  return null;
                }
                // --- END TIE-DYE FIRST ---
                // Handle Display Options
                if (category.hasDisplayOptions) {
                  const displayOption = formData.displayOptions?.[imagePath];
                  const totalDisplayQty = (Number(displayOption?.displayOnly || 0) + Number(displayOption?.displayStandardCasePack || 0));
                  if (totalDisplayQty > 0) {
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
                        {displayOption?.displayOnly && Number(displayOption.displayOnly) > 0 && (
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            padding: 'var(--space-1) 0', 
                            fontSize: '0.875rem', 
                            marginLeft: 'var(--space-3)' 
                          }}>
                            <span>Display Only</span>
                            <span style={{ fontWeight: '500' }}>Qty: {displayOption.displayOnly}</span>
                          </div>
                        )}
                        {displayOption?.displayStandardCasePack && Number(displayOption.displayStandardCasePack) > 0 && (
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            padding: 'var(--space-1) 0', 
                            fontSize: '0.875rem', 
                            marginLeft: 'var(--space-3)' 
                          }}>
                            <span>Display Standard Case Pack</span>
                            <span style={{ fontWeight: '500' }}>Qty: {displayOption.displayStandardCasePack}</span>
                          </div>
                        )}
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
                          <span>Qty: {totalDisplayQty}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }
                // Handle Sweatpants/Joggers
                if (category.name === 'Sweatpants/Joggers' && formData.sweatpantJoggerOptions) {
                  const sj = formData.sweatpantJoggerOptions[imagePath] || { sweatpantSteel: '', sweatpantOxford: '', joggerSteel: '', joggerOxford: '' };
                  const options = [
                    { key: 'sweatpantSteel', label: 'Straight-Leg Steel' },
                    { key: 'sweatpantOxford', label: 'Straight-Leg Oxford' },
                    { key: 'joggerSteel', label: 'Jogger Steel' },
                    { key: 'joggerOxford', label: 'Jogger Oxford' },
                  ];
                  const total = options.reduce((sum, opt) => sum + Number(sj[opt.key as keyof typeof sj] || 0), 0);
                  if (total > 0) {
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
                        }}>{productName}</div>
                        {options.map(opt => (
                          Number(sj[opt.key as keyof typeof sj]) > 0 && (
                            <div key={opt.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginLeft: 'var(--space-3)', padding: 'var(--space-1) 0' }}>
                              <span>{opt.label}</span>
                              <span style={{ fontWeight: '500' }}>Qty: {sj[opt.key as keyof typeof sj]}</span>
                            </div>
                          )
                        ))}
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
                          <span>Qty: {total}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }
                // Handle Color Versions
                if (hasColorVersions(img)) {
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
                        }}>{productName}</div>
                        {category.colorVersions?.map((color) => {
                          const colorKey = color as keyof ColorVersion;
                          const colorValue = colorVersions?.[colorKey];
                          const displayName = getColorDisplayName(color);
                          return (Number(colorValue) > 0 ? (
                            <div key={color} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginLeft: 'var(--space-3)', padding: 'var(--space-1) 0' }}>
                              <span>{displayName}</span>
                              <span style={{ fontWeight: '500' }}>Qty: {colorValue}</span>
                            </div>
                          ) : null);
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
                  return null;
                }
                // Handle Shirt Versions
                if (category.hasShirtVersions && category.shirtVersions) {
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
                        }}>{productName}</div>
                        {category.shirtVersions.map((version) => {
                          const versionKey = version as keyof ShirtVersion;
                          const versionValue = shirtVersions?.[versionKey];
                          const displayName = getVersionDisplayName(version);
                          return (Number(versionValue) > 0 ? (
                            <div key={version} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginLeft: 'var(--space-3)', padding: 'var(--space-1) 0' }}>
                              <span>{displayName}</span>
                              <span style={{ fontWeight: '500' }}>Qty: {versionValue}</span>
                            </div>
                          ) : null);
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
                  return null;
                }
                // Handle simple quantity items
                const qty = formData.quantities[imagePath] || '0';
                if (Number(qty) > 0) {
                  return (
                    <div key={img} style={{
                      marginBottom: 'var(--space-3)',
                      padding: 'var(--space-3)',
                      background: 'var(--color-bg)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--color-border)'
                    }}>
                      <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: 'var(--space-2)', color: 'var(--color-text)' }}>{productName}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginLeft: 'var(--space-3)', padding: 'var(--space-1) 0' }}>
                        <span>Qty</span>
                        <span style={{ fontWeight: '500' }}>{qty}</span>
                      </div>
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
                        <span>Qty: {qty}</span>
                      </div>
                    </div>
                  );
                }
                return null;
                // --- END UNIFIED CARD LAYOUT ---
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