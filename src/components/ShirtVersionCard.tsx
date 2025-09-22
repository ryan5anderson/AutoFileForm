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
  college?: string;
}

const ShirtVersionCard: React.FC<ShirtVersionCardProps> = ({
  categoryPath,
  imageName,
  shirtVersions = { tshirt: '', longsleeve: '', hoodie: '', crewneck: '' },
  availableVersions = ['tshirt'],
  onShirtVersionChange,
  readOnly = false,
  hideImage = false,
  college
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
          src={process.env.PUBLIC_URL + `/${college === 'arizonastate' ? 'ArizonaState' : 'MichiganState'}/${imagePath}`}
          alt={imageName}
          style={{ 
            width: '100%', 
            borderRadius: 'var(--radius)', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid var(--color-border)'
          }}
        />
      )}
      {!hideImage && (
        <div style={{ 
          fontSize: '0.875rem', 
          fontWeight: '500',
          color: 'var(--color-text)',
          textAlign: 'center'
        }}>
          {productName}
        </div>
      )}
      
      {availableVersions.map((version) => {
        const versionKey = version as keyof ShirtVersion;
        const displayName = getVersionDisplayName(version, imageName);
        
        return (
          <div key={version} className="field">
            <div className="field-label">{displayName}</div>
            <div className="field-control">
              <select
                id={`${version}-${imagePath}`}
                value={shirtVersions[versionKey] || ''}
                onChange={(e) => handleVersionChange(versionKey, e.target.value)}
                disabled={readOnly}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  background: '#fff',
                  minHeight: '44px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select</option>
                {getQuantityMultiples(imageName, version).map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>
          </div>
        );
      })}
      {readOnly && (
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