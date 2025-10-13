import React from 'react';
import { useParams } from 'react-router-dom';
import { FormData, Category, ShirtVersion, SizeCounts } from '../../types';
import { colleges } from '../../config';
import { getProductName, getImagePath, getVersionDisplayName, getRackToCardMapping, getRackDisplayName, getFilteredShirtVersions } from '../../features/utils';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { useOrderForm } from '../../features/hooks';
import '../../styles/college-pages.css';

interface ReceiptPageProps {
  formData?: FormData;
  onBackToSummary?: () => void;
  onExit?: () => void;
  categories?: Category[];
}

const ReceiptPage: React.FC<ReceiptPageProps> = ({ 
  formData: propFormData, 
  onBackToSummary: propOnBackToSummary, 
  onExit: propOnExit, 
  categories: propCategories 
}) => {
  // URL parameter handling
  const { college: urlCollege } = useParams();
  const collegeConfig = colleges[urlCollege as keyof typeof colleges];
  const categories: Category[] = propCategories || (collegeConfig ? collegeConfig.categories : []);
  
  // Use hook if no props provided (standalone mode)
  const hookData = useOrderForm(categories);
  const formData = propFormData || hookData.formData;
  const onBackToSummary = propOnBackToSummary || hookData.handleBackToSummary;
  const onExit = propOnExit || hookData.handleExit;

  // Dynamically set --color-primary for college branding
  React.useEffect(() => {
    if (urlCollege === 'arizonastate') {
      document.documentElement.style.setProperty('--color-primary', '#8c2434'); // Maroon
    } else if (urlCollege === 'michiganstate') {
      document.documentElement.style.setProperty('--color-primary', '#166534'); // MSU green
    } else if (urlCollege === 'westvirginiauniversity') {
      document.documentElement.style.setProperty('--color-primary', '#002855'); // WVU blue
    } else {
      document.documentElement.style.setProperty('--color-primary', '#111111'); // Default black
    }
  }, [urlCollege]);

  if (!collegeConfig && !propCategories) {
    return <div style={{ textAlign: 'center', marginTop: '2rem', color: '#dc2626' }}>College not found</div>;
  }
  // Generate auto-added cards based on rack selections
  const generateAutoAddedCards = () => {
    const rackToCardMapping = getRackToCardMapping();
    const autoAddedCards: { sku: string; name: string; qty: number }[] = [];

    // Find the rack category
    const rackCategory = categories.find((cat: Category) => cat.name === 'Display Options');
    if (rackCategory) {
      rackCategory.images.forEach((img: string) => {
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
      <Header showBackButton={true} />
      
      <main style={{
        flex: 1,
        padding: 'var(--space-4)',
        paddingTop: 'calc(64px + var(--space-4))', // Account for fixed header
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
          
          {[...categories].sort((a: Category, b: Category) => {
            const aIsDisplay = a.hasDisplayOptions || a.name.toLowerCase().includes('display options');
            const bIsDisplay = b.hasDisplayOptions || b.name.toLowerCase().includes('display options');
            if (aIsDisplay && !bIsDisplay) return 1;
            if (!aIsDisplay && bIsDisplay) return -1;
            return 0;
          }).filter(category => {
            // Check if any image in the category has a nonzero quantity or selection
            return category.images.some(img => {
              const imagePath = getImagePath(category.path, img);
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
              // Shirt Versions or Size Options - prefer size counts
              if (category.hasShirtVersions && category.shirtVersions) {
                const sizeByVersion = formData.shirtSizeCounts?.[imagePath];
                if (sizeByVersion && Object.values(sizeByVersion).some(counts => counts && Object.values(counts).some(v => Number(v) > 0))) return true;
                const shirtVersions = formData.shirtVersions?.[imagePath];
                if (shirtVersions && Object.values(shirtVersions).some(val => Number(val) > 0)) return true;
              }
              // Size Options (for non-shirt categories like flannels, jackets, etc.)
              if (category.hasSizeOptions) {
                const sizeByVersion = formData.shirtSizeCounts?.[imagePath];
                if (sizeByVersion && Object.values(sizeByVersion).some(counts => counts && Object.values(counts).some(v => Number(v) > 0))) return true;
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
                  const sj = formData.sweatpantJoggerOptions[imagePath] || { sweatpantSteel: '', sweatpantBlack: '', sweatpantDarkNavy: '', joggerSteel: '', joggerDarkHeather: '' };
                  const options = [
                    { key: 'sweatpantSteel', label: 'Straight-Leg Steel' },
                    { key: 'sweatpantBlack', label: 'Straight-Leg Black' },
                    { key: 'sweatpantDarkNavy', label: 'Straight-Leg Dark Navy' },
                    { key: 'joggerSteel', label: 'Jogger Steel' },
                    { key: 'joggerDarkHeather', label: 'Jogger Dark Heather' },
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
                // Handle Shirt Versions (size breakdown)
                if (category.hasShirtVersions && category.shirtVersions) {
                  const sizeByVersion = formData.shirtSizeCounts?.[imagePath] || {};
                  const filteredVersions = getFilteredShirtVersions(img, category.shirtVersions);
                  const totalsByVersion = filteredVersions.map((version) => {
                    const counts = sizeByVersion[version as keyof ShirtVersion];
                    return counts ? Object.values(counts).reduce((a,b)=>a+b,0) : 0;
                  });
                  const totalQty = totalsByVersion.reduce((a,b)=>a+b,0);
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
                        {filteredVersions.map((version, idx) => {
                          const counts = sizeByVersion[version as keyof ShirtVersion];
                          const vTotal = totalsByVersion[idx];
                          const displayName = getVersionDisplayName(version);
                          if (vTotal <= 0) return null;
                          const sizeOrder: ('S'|'M'|'L'|'XL'|'XXL'|'XXXL'|'S/M'|'L/XL')[] = ['S','M','L','XL','XXL','XXXL','S/M','L/XL'];
                          const sizePieces = counts ? sizeOrder
                            .map((sz) => {
                              const val = counts[sz] || 0;
                              return val > 0 ? `${sz}${val}` : '';
                            })
                            .filter(Boolean)
                            .join(' ') : '';
                          return (
                            <div key={version} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginLeft: 'var(--space-3)', padding: 'var(--space-1) 0' }}>
                              <span>{displayName}{sizePieces ? ` (${sizePieces})` : ''}</span>
                              <span style={{ fontWeight: '500' }}>Qty: {vTotal}</span>
                            </div>
                          );
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

                // Handle Size Options (for non-shirt categories like flannels, jackets, etc.)
                if (category.hasSizeOptions) {
                  const sizeByVersion = formData.shirtSizeCounts?.[imagePath] || {};

                  // Determine which version keys to look for based on product type
                  let versionOrder: string[];
                  if (category.hasShirtVersions) {
                    // For T-shirts and similar products with shirt versions
                    versionOrder = ['tshirt', 'longsleeve', 'hoodie', 'crewneck'];
                  } else {
                    // For products like socks, jackets, flannels, etc. - use whatever keys are actually present
                    versionOrder = Object.keys(sizeByVersion);
                  }

                  const totalsByVersion = versionOrder.map((vk) => {
                    const c = sizeByVersion[vk as keyof typeof sizeByVersion] as SizeCounts;
                    return c ? Object.values(c).reduce((a,b)=>a+b,0) : 0;
                  });
                  const totalQty = totalsByVersion.reduce((a,b)=>a+b,0);
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
                        {versionOrder.map((vk, i) => {
                          const vTotal = totalsByVersion[i];
                          if (vTotal > 0) {
                            const c = sizeByVersion[vk as keyof typeof sizeByVersion] as SizeCounts;
                            const sizeOrder: ('S'|'M'|'L'|'XL'|'XXL'|'XXXL'|'S/M'|'L/XL')[] = ['S','M','L','XL','XXL','XXXL','S/M','L/XL'];
                            const sizePieces = c ? sizeOrder
                              .map((sz) => {
                                const val = c[sz] || 0;
                                return val > 0 ? `${sz}${val}` : '';
                              })
                              .filter(Boolean)
                              .join(' ') : '';

                            // For shirt versions, use the standard labels
                            let versionLabel = vk;
                            if (category.hasShirtVersions) {
                              const labels: Record<string, string> = { tshirt: 'T-Shirt', longsleeve: 'Long Sleeve', hoodie: 'Hoodie', crewneck: 'Crew' };
                              versionLabel = labels[vk as keyof typeof labels] || vk;
                            }

                            return (
                              <div key={vk} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginLeft: 'var(--space-3)', padding: 'var(--space-1) 0' }}>
                                <span>{versionLabel}{sizePieces ? ` (${sizePieces})` : ''}</span>
                                <span style={{ fontWeight: '500' }}>Qty: {vTotal}</span>
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