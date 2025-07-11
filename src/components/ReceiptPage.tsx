import React from 'react';
import { FormData, Category, ShirtVersion } from '../types';
import { categories } from '../constants';
import { getProductName, getImagePath, getShirtVersionTotal, getVersionDisplayName } from '../utils';

interface ReceiptPageProps {
  formData: FormData;
  onBackToSummary: () => void;
  onExit: () => void;
}

const ReceiptPage: React.FC<ReceiptPageProps> = ({ formData, onBackToSummary, onExit }) => {
  return (
    <div style={{ 
      background: 'var(--color-bg)', 
      minHeight: '100vh', 
      padding: 'var(--space-4)',
      maxWidth: '800px',
      margin: '0 auto'
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
              const productName = getProductName(img);
              
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
      </div>
    </div>
  );
};

export default ReceiptPage; 