import React from 'react';
import { useParams } from 'react-router-dom';

import { colleges } from '../../config';
import { useOrderForm } from '../../features/hooks';
import { getProductName, getVersionDisplayName, getRackDisplayName, getFilteredShirtVersions } from '../../features/utils';
import { FormData, Category, ShirtVersion, SizeCounts } from '../../types';
import Footer from '../layout/Footer';
import Header from '../layout/Header';
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
    } else if (urlCollege === 'pittsburghuniversity') {
      document.documentElement.style.setProperty('--color-primary', '#003594'); // Pitt blue
    } else if (urlCollege === 'alabamauniversity') {
      document.documentElement.style.setProperty('--color-primary', '#9E1B32'); // Alabama Crimson
    } else {
      document.documentElement.style.setProperty('--color-primary', '#111111'); // Default black
    }
  }, [urlCollege]);

  if (!collegeConfig && !propCategories) {
    return <div style={{ textAlign: 'center', marginTop: '2rem', color: '#dc2626' }}>College not found</div>;
  }

  const handlePrintReceipt = () => {
    window.print();
  };

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
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          marginBottom: 'var(--space-6)'
        }}>
          <h1 style={{ 
            color: 'var(--color-primary)', 
            margin: '0',
            textAlign: 'center',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: '600',
            position: 'relative',
            width: '100%',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}>
            Order Receipt
          </h1>
        </div>
        
        <div className="receipt-container" style={{ 
          background: 'var(--color-bg)', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-lg)', 
          padding: 'var(--space-4)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          width: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}>
          <div style={{ 
            marginBottom: 'var(--space-4)',
            paddingBottom: 'var(--space-3)',
            borderBottom: '1px solid var(--color-border)'
          }}>
            <div className="receipt-header-grid" style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-2)',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div><strong style={{ color: 'var(--color-text)' }}>Store Name:</strong> {formData.company}</div>
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
              const imagePath = `${category.path}/${img}`;
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
              // Pant Options (for pants with style/color/size options)
              if (category.hasPantOptions && formData.pantOptions) {
                const pOptions = formData.pantOptions[imagePath];
                if (pOptions) {
                  // Check if any style/color combination has quantities > 0
                  const hasQuantities = Object.values(pOptions).some(style => 
                    style && typeof style === 'object' && Object.values(style).some(color => 
                      color && typeof color === 'object' && Object.values(color).some(qty => Number(qty) > 0)
                    )
                  );
                  if (hasQuantities) return true;
                }
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
              // Color options (for hats, etc.)
              if (formData.colorOptions && formData.colorOptions[imagePath]) {
                const colorOpts = formData.colorOptions[imagePath];
                if (Object.values(colorOpts).some(qty => Number(qty) > 0)) return true;
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
                const imagePath = `${category.path}/${img}`;
                const productName = category.name === 'Display Options' ? getRackDisplayName(img) : getProductName(img);
                // Handle Display Options
                if (category.hasDisplayOptions) {
                  const displayOption = formData.displayOptions?.[imagePath];
                  const totalDisplayQty = (Number(displayOption?.displayOnly || 0) + Number(displayOption?.displayStandardCasePack || 0));
                  if (totalDisplayQty > 0) {
                    return (
                      <div key={img} className="receipt-item" style={{ 
                        marginBottom: 'var(--space-3)',
                        padding: 'var(--space-3)',
                        background: 'var(--color-bg)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--color-border)',
                        width: '100%',
                        boxSizing: 'border-box',
                        overflowX: 'hidden'
                      }}>
                        <div className="receipt-item-title" style={{ 
                          fontWeight: '600', 
                          fontSize: '1rem',
                          marginBottom: 'var(--space-2)',
                          color: 'var(--color-text)',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word'
                        }}>
                          {productName}
                        </div>
                        {displayOption?.displayOnly && Number(displayOption.displayOnly) > 0 && (
                          <div className="receipt-item-row" style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            padding: 'var(--space-1) 0', 
                            fontSize: '0.875rem', 
                            marginLeft: 'var(--space-3)',
                            flexWrap: 'wrap',
                            gap: '4px'
                          }}>
                            <span>Display Only</span>
                            <span style={{ fontWeight: '500' }}>Qty: {displayOption.displayOnly}</span>
                          </div>
                        )}
                        {displayOption?.displayStandardCasePack && Number(displayOption.displayStandardCasePack) > 0 && (
                          <div className="receipt-item-row" style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            padding: 'var(--space-1) 0', 
                            fontSize: '0.875rem', 
                            marginLeft: 'var(--space-3)',
                            flexWrap: 'wrap',
                            gap: '4px'
                          }}>
                            <span>Display Standard Case Pack</span>
                            <span style={{ fontWeight: '500' }}>Qty: {displayOption.displayStandardCasePack}</span>
                          </div>
                        )}
                        <div className="receipt-item-row" style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          padding: 'var(--space-1) 0', 
                          fontSize: '0.875rem', 
                          marginLeft: 'var(--space-3)', 
                          fontWeight: '600',
                          color: 'var(--color-primary)',
                          borderTop: '1px solid var(--color-border)',
                          marginTop: 'var(--space-2)',
                          paddingTop: 'var(--space-2)',
                          flexWrap: 'wrap',
                          gap: '4px'
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
                          color: 'var(--color-text)',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          hyphens: 'auto',
                          maxWidth: '100%'
                        }}>{productName}</div>
                        {options.map(opt => (
                          Number(sj[opt.key as keyof typeof sj]) > 0 && (
                            <div key={opt.key} className="receipt-item-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginLeft: 'var(--space-3)', padding: 'var(--space-1) 0', flexWrap: 'wrap', gap: '4px' }}>
                              <span>{opt.label}</span>
                              <span style={{ fontWeight: '500' }}>Qty: {sj[opt.key as keyof typeof sj]}</span>
                            </div>
                          )
                        ))}
                        <div className="receipt-item-row" style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: 'var(--space-1) 0',
                          fontSize: '0.875rem',
                          marginLeft: 'var(--space-3)',
                          fontWeight: '600',
                          color: 'var(--color-primary)',
                          borderTop: '1px solid var(--color-border)',
                          marginTop: 'var(--space-2)',
                          paddingTop: 'var(--space-2)',
                          flexWrap: 'wrap',
                          gap: '4px'
                        }}>
                          <span>Total</span>
                          <span>Qty: {total}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }
                // Handle Pant Options (for pants with style/color/size options)
                if (category.hasPantOptions && formData.pantOptions) {
                  const pOptions = formData.pantOptions[imagePath];
                  if (pOptions) {
                    const pantItems: React.ReactElement[] = [];
                    let totalPantQty = 0;

                    // Helper function to process size counts for a specific style and color
                    const processSizeCounts = (styleName: string, colorName: string, sizeCounts: any) => {
                      if (!sizeCounts || typeof sizeCounts !== 'object') return;

                      // Format sizes as "S: 1 M: 2 XL: 3" etc.
                      const sizeOrder: ('XS'|'S'|'M'|'L'|'XL'|'XXL'|'XXXL'|'S/M'|'L/XL'|'SM')[] = ['XS','S','M','L','XL','XXL','XXXL','S/M','L/XL','SM'];
                      const formattedSizes = sizeOrder
                        .map(sz => {
                          const val = sizeCounts[sz] || 0;
                          return val > 0 ? `${sz}: ${val}` : '';
                        })
                        .filter(Boolean)
                        .join(', ');

                      const totalQty = Object.values(sizeCounts).reduce((a: number, b: unknown) => a + (typeof b === 'number' ? b : 0), 0);

                      if (totalQty > 0) {
                        pantItems.push(
                          <div key={`${styleName}-${colorName}`} className="receipt-item-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginLeft: 'var(--space-3)', padding: 'var(--space-1) 0', flexWrap: 'wrap', gap: '4px' }}>
                            <span>{`${styleName} - ${colorName}${formattedSizes ? ` ${formattedSizes}` : ''}`}</span>
                            <span style={{ fontWeight: '500' }}>Qty: {totalQty}</span>
                          </div>
                        );
                        totalPantQty += totalQty;
                      }
                    };

                    // Process Sweatpants
                    if (pOptions.sweatpants) {
                      processSizeCounts('Sweatpants', 'Steel', pOptions.sweatpants.steel);
                      processSizeCounts('Sweatpants', 'Black', pOptions.sweatpants.black);
                      processSizeCounts('Sweatpants', 'Dark Navy', pOptions.sweatpants.darkNavy);
                    }

                    // Process Joggers
                    if (pOptions.joggers) {
                      processSizeCounts('Joggers', 'Steel', pOptions.joggers.steel);
                      processSizeCounts('Joggers', 'Dark Heather', pOptions.joggers.darkHeather);
                    }

                    if (totalPantQty > 0) {
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
                            color: 'var(--color-text)',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            hyphens: 'auto',
                            maxWidth: '100%'
                          }}>{productName}</div>
                          {pantItems}
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
                            <span>Qty: {totalPantQty}</span>
                          </div>
                        </div>
                      );
                    }
                  }
                  return null;
                }
                // Handle Infant products with 6M/12M sizes FIRST (only check by image name, not category name)
                // This allows youth products in "Youth & Infant" category to use shirtSizeCounts
                // Must check BEFORE shirt versions/size options checks to avoid conflicts
                if ((img.toLowerCase().includes('infant') || img.toLowerCase().includes('onsie')) && formData.infantSizeCounts) {
                  const infantCounts = formData.infantSizeCounts[imagePath];
                  if (infantCounts) {
                    const totalQty = Object.values(infantCounts).reduce((sum: number, count: number) => sum + count, 0);
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
                            color: 'var(--color-text)',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            hyphens: 'auto',
                            maxWidth: '100%'
                          }}>{productName}</div>
                          <div className="receipt-item-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginLeft: 'var(--space-3)', padding: 'var(--space-1) 0', flexWrap: 'wrap', gap: '4px' }}>
                            <span>
                              {[
                                infantCounts['6M'] > 0 ? `6M: ${infantCounts['6M']}` : '',
                                infantCounts['12M'] > 0 ? `12M: ${infantCounts['12M']}` : ''
                              ].filter(Boolean).join(', ')}
                            </span>
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
                            <span>Qty: {totalQty}</span>
                          </div>
                        </div>
                      );
                    }
                  }
                  return null;
                }
                // Handle Shirt Versions with color-based size counts
                if (category.hasShirtVersions && category.shirtVersions) {
                  const colorSizeCountsByVersion = formData.shirtColorSizeCounts?.[imagePath];
                  if (colorSizeCountsByVersion) {
                    const filteredVersions = getFilteredShirtVersions(img, category.shirtVersions, category.tieDyeImages, category.crewOnlyImages);
                    let totalShirtQty = 0;
                    
                    // Group by color first
                    const colorGroups: Map<string, string[]> = new Map();
                    
                    filteredVersions.forEach((version) => {
                      const byColor = colorSizeCountsByVersion[version as keyof ShirtVersion];
                      if (byColor) {
                        const versionTotal = Object.values(byColor).reduce((colorSum, counts) => {
                          if (!counts) return colorSum;
                          return colorSum + Object.values(counts).reduce((sizeSum: number, qty: number) => sizeSum + qty, 0);
                        }, 0);

                        if (versionTotal > 0) {
                          totalShirtQty += versionTotal;
                          const displayName = getVersionDisplayName(version);
                          
                          Object.entries(byColor)
                            .filter(([_, counts]) => counts && Object.values(counts).some(qty => qty > 0))
                            .forEach(([colorName, counts]) => {
                              if (!counts) return;
                              const sizeOrder: ('XS'|'S'|'M'|'L'|'XL'|'XXL'|'XXXL'|'S/M'|'L/XL'|'SM')[] = ['XS','S','M','L','XL','XXL','XXXL','S/M','L/XL','SM'];
                              
                              sizeOrder.forEach(sz => {
                                const val = counts[sz] || 0;
                                if (val > 0) {
                                  if (!colorGroups.has(colorName)) {
                                    colorGroups.set(colorName, []);
                                  }
                                  colorGroups.get(colorName)!.push(`${displayName} ${sz}:${val}`);
                                }
                              });
                            });
                        }
                      }
                    });

                    if (totalShirtQty > 0) {
                      const colorItems: React.ReactElement[] = [];
                      colorGroups.forEach((versionSizes, colorName) => {
                        colorItems.push(
                          <div key={colorName} className="receipt-item-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginLeft: 'var(--space-3)', padding: 'var(--space-1) 0', flexWrap: 'wrap', gap: '4px' }}>
                            <span>{colorName}: {versionSizes.join(' ; ')}</span>
                          </div>
                        );
                      });

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
                            color: 'var(--color-text)',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            hyphens: 'auto',
                            maxWidth: '100%'
                          }}>{productName}</div>
                          {colorItems}
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
                            <span>Qty: {totalShirtQty}</span>
                          </div>
                        </div>
                      );
                    }
                  }

                  // Handle Shirt Versions (regular size breakdown - no colors) - combine into one line
                  const sizeByVersion = formData.shirtSizeCounts?.[imagePath] || {};
                  const filteredVersions = getFilteredShirtVersions(img, category.shirtVersions);
                  const versionDetails: string[] = [];
                  let totalQty = 0;

                  filteredVersions.forEach((version) => {
                    const counts = sizeByVersion[version as keyof ShirtVersion];
                    const vTotal = counts ? Object.values(counts).reduce((a,b)=>a+b,0) : 0;
                    if (vTotal > 0) {
                      totalQty += vTotal;
                      const displayName = getVersionDisplayName(version);
                      const sizeOrder: ('XS'|'S'|'M'|'L'|'XL'|'XXL'|'XXXL'|'S/M'|'L/XL'|'SM')[] = ['XS','S','M','L','XL','XXL','XXXL','S/M','L/XL','SM'];
                      
                      // Format sizes as "M: 1" etc.
                      const formattedSizes = counts ? sizeOrder
                        .map((sz) => {
                          const val = counts[sz] || 0;
                          return val > 0 ? `${sz}: ${val}` : '';
                        })
                        .filter(Boolean)
                        .join(', ') : '';
                      
                      // Special handling for socks - show just the size breakdown
                      // For youth products (in Youth & Infant category), don't show version name
                      const isYouth = category.name === 'Youth & Infant' && img.toLowerCase().includes('youth');
                      const displayText = img.toLowerCase().includes('sock') && formattedSizes 
                        ? formattedSizes 
                        : isYouth && formattedSizes
                        ? formattedSizes
                        : `${displayName}${formattedSizes ? ` ${formattedSizes}` : ''}`;
                      versionDetails.push(displayText);
                    }
                  });

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
                          color: 'var(--color-text)',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          hyphens: 'auto',
                          maxWidth: '100%'
                        }}>{productName}</div>
                        <div className="receipt-item-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginLeft: 'var(--space-3)', padding: 'var(--space-1) 0', flexWrap: 'wrap', gap: '4px' }}>
                          <span>{versionDetails.join(' ; ')}</span>
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
                          color: 'var(--color-text)',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          hyphens: 'auto',
                          maxWidth: '100%'
                        }}>{productName}</div>
                        {versionOrder.map((vk, i) => {
                          const vTotal = totalsByVersion[i];
                          if (vTotal > 0) {
                            const c = sizeByVersion[vk as keyof typeof sizeByVersion] as SizeCounts;
                            // Include sock sizes in the size order
                            const sizeOrder: ('XS'|'S'|'M'|'L'|'XL'|'XXL'|'XXXL'|'S/M'|'L/XL'|'SM')[] = ['XS','S','M','L','XL','XXL','XXXL','S/M','L/XL','SM'];
                            
                            // Format sizes as "S: 1 M: 2 XL: 3" etc.
                            const formattedSizes = c ? sizeOrder
                              .map((sz) => {
                                const val = c[sz] || 0;
                                return val > 0 ? `${sz}: ${val}` : '';
                              })
                              .filter(Boolean)
                              .join(', ') : '';

                            // For shirt versions, use the standard labels
                            let versionLabel = vk;
                            if (category.hasShirtVersions) {
                              const labels: Record<string, string> = { tshirt: 'T-Shirt', longsleeve: 'Long Sleeve', hoodie: 'Hoodie', crewneck: 'Crew' };
                              versionLabel = labels[vk as keyof typeof labels] || vk;
                            } else {
                              // Remove category-specific words from version labels
                              versionLabel = vk.replace(/(jacket|flannels|shorts|socks)/gi, '').trim();
                            }

                            // Special handling for socks - show just the size breakdown
                            // For youth products (in Youth & Infant category), don't show version name
                            const isYouth = category.name === 'Youth & Infant' && img.toLowerCase().includes('youth');
                            const displayText = img.toLowerCase().includes('sock') && formattedSizes 
                              ? formattedSizes 
                              : isYouth && formattedSizes
                              ? formattedSizes
                              : `${versionLabel}${formattedSizes ? ` ${formattedSizes}` : ''}`;

                            return (
                              <div key={vk} className="receipt-item-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginLeft: 'var(--space-3)', padding: 'var(--space-1) 0', flexWrap: 'wrap', gap: '4px' }}>
                                <span>{displayText}</span>
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
                // Handle color options for items like hats
                if (formData.colorOptions && formData.colorOptions[imagePath]) {
                  const colorOpts = formData.colorOptions[imagePath];
                  let totalColorQty = 0;
                  const colorDetails: string[] = [];
                  
                  Object.entries(colorOpts).forEach(([colorName, qty]) => {
                    const quantity = Number(qty) || 0;
                    if (quantity > 0) {
                      totalColorQty += quantity;
                      colorDetails.push(`${colorName} ${quantity}`);
                    }
                  });
                  
                  if (totalColorQty > 0) {
                    return (
                      <div key={img} style={{
                        marginBottom: 'var(--space-3)',
                        padding: 'var(--space-3)',
                        background: 'var(--color-bg)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--color-border)'
                      }}>
                        <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: 'var(--space-2)', color: 'var(--color-text)', wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto', maxWidth: '100%' }}>{productName}</div>
                        <div className="receipt-item-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginLeft: 'var(--space-3)', padding: 'var(--space-1) 0', flexWrap: 'wrap', gap: '4px' }}>
                          <span>{colorDetails.join(' ')}</span>
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
                          <span>Qty: {totalColorQty}</span>
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
                      <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: 'var(--space-2)', color: 'var(--color-text)', wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto', maxWidth: '100%' }}>{productName}</div>
                      <div className="receipt-item-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginLeft: 'var(--space-3)', padding: 'var(--space-1) 0', flexWrap: 'wrap', gap: '4px' }}>
                        <span>{productName}</span>
                        <span style={{ fontWeight: '500' }}>Qty: {qty}</span>
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

        <div className="receipt-buttons" style={{ 
          display: 'flex', 
          justifyContent: 'center',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-6)',
          flexWrap: 'wrap',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <button
            type="button"
            onClick={onBackToSummary}
            className="receipt-button"
            style={{
              background: 'var(--color-bg)',
              color: 'var(--color-primary)',
              padding: 'var(--space-3) var(--space-4)',
              border: '2px solid var(--color-primary)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '150px',
              boxSizing: 'border-box'
            }}
          >
            Back to Summary
          </button>
          
          <button
            type="button"
            onClick={onExit}
            className="receipt-button"
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              padding: 'var(--space-3) var(--space-4)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '150px',
              boxSizing: 'border-box'
            }}
          >
            Exit
          </button>

          <button
            type="button"
            onClick={handlePrintReceipt}
            className="receipt-button"
            style={{
              background: 'var(--color-success)',
              color: 'white',
              padding: 'var(--space-3) var(--space-4)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '150px',
              boxSizing: 'border-box'
            }}
          >
            Print Receipt
          </button>
        </div>
      </main>
      
      <Footer />
      
      <style>{`
        @media (max-width: 768px) {
          main {
            padding: 16px 12px !important;
            padding-top: calc(64px + 16px) !important;
          }
          
          .receipt-container {
            padding: 16px !important;
          }
          
          .receipt-header-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          
          .receipt-item {
            padding: 12px !important;
            margin-bottom: 12px !important;
          }
          
          .receipt-item-title {
            font-size: 0.9375rem !important;
            margin-bottom: 8px !important;
          }
          
          .receipt-item-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 4px !important;
            margin-left: 0 !important;
            padding: 6px 0 !important;
          }
          
          .receipt-item-row span:last-child {
            font-weight: 600 !important;
          }
          
          .receipt-buttons {
            flex-direction: column !important;
            gap: 12px !important;
          }
          
          .receipt-button {
            width: 100% !important;
            min-width: auto !important;
          }
        }
        
        @media (max-width: 480px) {
          main {
            padding: 12px 8px !important;
            padding-top: calc(64px + 12px) !important;
          }
          
          .receipt-container {
            padding: 12px !important;
          }
          
          .receipt-header-grid {
            gap: 8px !important;
          }
          
          .receipt-item {
            padding: 10px !important;
          }
          
          .receipt-item-title {
            font-size: 0.875rem !important;
          }
          
          .receipt-item-row {
            font-size: 0.8125rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptPage; 