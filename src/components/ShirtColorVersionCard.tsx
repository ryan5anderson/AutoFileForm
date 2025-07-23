import React from 'react';
import { getProductName, getImagePath, getVersionDisplayName, getColorDisplayName, getQuantityMultiples } from '../utils';
import { ShirtColorComboVersion } from '../types';

interface ShirtColorVersionCardProps {
  categoryPath: string;
  imageName: string;
  shirtColorComboVersion?: ShirtColorComboVersion;
  availableVersions?: string[];
  availableColors?: string[];
  onShirtColorComboChange?: (imagePath: string, version: string, color: string, value: string) => void;
  readOnly?: boolean;
  hideImage?: boolean;
  college?: string;
}

const ShirtColorVersionCard: React.FC<ShirtColorVersionCardProps> = ({
  categoryPath,
  imageName,
  shirtColorComboVersion = {},
  availableVersions = ['tshirt', 'longsleeve', 'hoodie', 'crewneck'],
  availableColors = ['black', 'forest'],
  onShirtColorComboChange,
  readOnly = false,
  hideImage = false,
  college
}) => {
  const imagePath = getImagePath(categoryPath, imageName);
  const productName = getProductName(imageName);

  const getComboKey = (version: string, color: string) => `${version}_${color}`;

  const handleComboChange = (version: string, color: string, value: string) => {
    onShirtColorComboChange?.(imagePath, version, color, value);
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
          textAlign: 'center',
          marginBottom: 'var(--space-2)'
        }}>
          {productName}
        </div>
      )}
      {!readOnly ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 'var(--space-2)',
          padding: 'var(--space-2)',
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius)'
        }}>
          {availableColors.map(color => (
            availableVersions.map(version => {
              const comboKey = getComboKey(version, color);
              return (
                <div key={comboKey} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: 'var(--space-2)'
                }}>
                  <label
                    htmlFor={`${comboKey}-${imagePath}`}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      minWidth: '60px',
                      textAlign: 'left',
                    }}
                  >
                    {getVersionDisplayName(version, imageName)} {getColorDisplayName(color)}:
                  </label>
                  <select
                    id={`${comboKey}-${imagePath}`}
                    value={shirtColorComboVersion[comboKey] || ''}
                    onChange={e => handleComboChange(version, color, e.target.value)}
                    style={{
                      width: '80px',
                      padding: 'var(--space-1) var(--space-2)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius)',
                      fontSize: '0.75rem',
                      background: 'var(--color-input-bg)',
                      textAlign: 'center',
                    }}
                    disabled={readOnly}
                  >
                    <option value="">Select</option>
                    {getQuantityMultiples(imageName, categoryPath).map(val => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                </div>
              );
            })
          ))}
        </div>
      ) : (
        <div style={{ 
          fontSize: '0.875rem',
          padding: 'var(--space-2)',
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)'
        }}>
          {availableColors.map(color => (
            availableVersions.map(version => {
              const comboKey = getComboKey(version, color);
              const label = `${getVersionDisplayName(version, imageName)} ${getColorDisplayName(color)}`;
              const quantity = shirtColorComboVersion[comboKey] || '';
              return (
                <div key={comboKey} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-1)'
                }}>
                  <span>{label}:</span>
                  <span style={{ fontWeight: '500' }}>{quantity || '0'}</span>
                </div>
              );
            })
          ))}
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
            <span>{Object.values(shirtColorComboVersion).reduce((sum, qty) => sum + Number(qty || 0), 0)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShirtColorVersionCard; 