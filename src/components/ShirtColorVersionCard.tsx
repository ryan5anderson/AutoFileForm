import React from 'react';
import { getProductName, getImagePath, getVersionDisplayName, getColorDisplayName } from '../utils';
import { ShirtColorComboVersion } from '../types';

interface ShirtColorVersionCardProps {
  categoryPath: string;
  imageName: string;
  shirtColorComboVersion?: ShirtColorComboVersion;
  availableVersions?: string[];
  availableColors?: string[];
  onShirtColorComboChange?: (imagePath: string, version: string, color: string, value: string) => void;
  readOnly?: boolean;
}

const ShirtColorVersionCard: React.FC<ShirtColorVersionCardProps> = ({
  categoryPath,
  imageName,
  shirtColorComboVersion = {},
  availableVersions = ['tshirt', 'longsleeve', 'hoodie', 'crewneck'],
  availableColors = ['black', 'forest'],
  onShirtColorComboChange,
  readOnly = false
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
      <div style={{ 
        fontSize: '0.875rem', 
        fontWeight: '500',
        color: 'var(--color-text)',
        textAlign: 'center',
        marginBottom: 'var(--space-2)'
      }}>
        {productName}
      </div>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 'var(--space-2)',
        padding: 'var(--space-2)',
        background: 'var(--color-bg)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)'
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
                  {getVersionDisplayName(version)} {getColorDisplayName(color)}:
                </label>
                <input
                  type="number"
                  id={`${comboKey}-${imagePath}`}
                  min="0"
                  value={shirtColorComboVersion[comboKey] || ''}
                  onChange={e => handleComboChange(version, color, e.target.value)}
                  style={{
                    width: '50px',
                    padding: 'var(--space-1) var(--space-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.75rem',
                    background: 'var(--color-input-bg)',
                    textAlign: 'center',
                  }}
                  disabled={readOnly}
                />
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
};

export default ShirtColorVersionCard; 