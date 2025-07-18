import React from 'react';
import { getProductName, getImagePath, getShirtVersionTotal, getVersionDisplayName, getQuantityMultiples } from '../utils';
import { ShirtVersion } from '../types';

interface ShirtVersionCardProps {
  categoryPath: string;
  imageName: string;
  shirtVersions?: ShirtVersion;
  availableVersions?: string[];
  onShirtVersionChange?: (imagePath: string, version: keyof ShirtVersion, value: string) => void;
  readOnly?: boolean;
  hideImage?: boolean;
}

const ShirtVersionCard: React.FC<ShirtVersionCardProps> = ({
  categoryPath,
  imageName,
  shirtVersions = { tshirt: '', longsleeve: '', hoodie: '', crewneck: '' },
  availableVersions = ['tshirt'],
  onShirtVersionChange,
  readOnly = false,
  hideImage = false
}) => {
  const imagePath = getImagePath(categoryPath, imageName);
  const productName = getProductName(imageName);
  const totalQuantity = getShirtVersionTotal(shirtVersions, availableVersions);

  const handleVersionChange = (version: keyof ShirtVersion, value: string) => {
    onShirtVersionChange?.(imagePath, version, value);
  };

  return (
    <div style={{ 
      background: 'var(--color-bg)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-3)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)'
    }}>
      {!hideImage && (
        <img
          src={process.env.PUBLIC_URL + `/MichiganState/${imagePath}`}
          alt={imageName}
          style={{ 
            width: '100%', 
            borderRadius: 'var(--radius)', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid var(--color-border)'
          }}
        />
      )}
      <div style={{ 
        fontSize: '0.875rem', 
        fontWeight: '500',
        color: 'var(--color-text)',
        textAlign: 'center'
      }}>
        {productName}
      </div>
      
      {!readOnly ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 'var(--space-2)',
          padding: 'var(--space-2)',
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)'
        }}>
          {availableVersions.map((version) => {
            const versionKey = version as keyof ShirtVersion;
            const displayName = getVersionDisplayName(version, imageName);
            
            return (
              <div key={version} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                gap: 'var(--space-2)' 
              }}>
                <label 
                  htmlFor={`${version}-${imagePath}`} 
                  style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '600',
                    color: 'var(--color-text)',
                    minWidth: '60px'
                  }}
                >
                  {displayName}:
                </label>
                <select
                  id={`${version}-${imagePath}`}
                  value={shirtVersions[versionKey] || ''}
                  onChange={(e) => handleVersionChange(versionKey, e.target.value)}
                  style={{
                    width: '60px',
                    padding: 'var(--space-1) var(--space-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.75rem',
                    background: 'var(--color-input-bg)',
                    textAlign: 'center'
                  }}
                >
                  <option value="">Select</option>
                  {getQuantityMultiples(imageName, version).map(val => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ 
          fontSize: '0.875rem',
          padding: 'var(--space-2)',
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)'
        }}>
          {availableVersions.map((version) => {
            const versionKey = version as keyof ShirtVersion;
            const displayName = getVersionDisplayName(version, imageName);
            const quantity = shirtVersions[versionKey] || '';
            
            return (
              <div key={version} style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-1)'
              }}>
                <span>{displayName}:</span>
                <span style={{ fontWeight: '500' }}>{quantity || '0'}</span>
              </div>
            );
          })}
          <div style={{ 
            fontWeight: '600', 
            marginTop: 'var(--space-2)',
            paddingTop: 'var(--space-2)',
            borderTop: '1px solid var(--color-border)',
            color: 'var(--color-primary)',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>Total:</span>
            <span>{totalQuantity}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShirtVersionCard; 