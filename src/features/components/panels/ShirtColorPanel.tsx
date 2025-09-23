import React from 'react';
import { getProductName, getImagePath, getVersionDisplayName, getColorDisplayName } from '../../utils';
import { ShirtColorComboVersion, SizeCounts, Size } from '../../../types';
import { asset } from '../../../utils/asset';
import QuantityStepper from './QuantityStepper';
import SizePackSelector from './SizePackSelector';

interface ShirtColorVersionCardProps {
  categoryPath: string;
  imageName: string;
  shirtColorComboVersion?: ShirtColorComboVersion;
  availableVersions?: string[];
  availableColors?: string[];
  onShirtColorComboChange?: (imagePath: string, version: string, color: string, value: string) => void;
  onShirtColorComboSizeCountsChange?: (imagePath: string, version: string, color: string, counts: SizeCounts) => void;
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
  onShirtColorComboSizeCountsChange,
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
          src={asset(`${college === 'arizonastate' ? 'ArizonaState' : 'MichiganState'}/${imagePath}`)}
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
      {availableColors.map(color => (
        availableVersions.map(version => {
          const comboKey = getComboKey(version, color);
          const counts: SizeCounts = (shirtColorComboVersion[comboKey] as any) as SizeCounts; // legacy value may exist as string; prefer size counts via prop
          const safeCounts: SizeCounts = counts && typeof counts === 'object' ? counts : ({ S: 0, M: 0, L: 0, XL: 0, XXL: 0 } as Record<Size, number>);
          return (
            <div key={comboKey} className="field">
              <div className="field-label">
                {getVersionDisplayName(version, imageName)} {getColorDisplayName(color)}
              </div>
              {!readOnly && (
                <SizePackSelector
                  counts={safeCounts}
                  onChange={(c) => onShirtColorComboSizeCountsChange?.(imagePath, version, color, c)}
                />
              )}
              {readOnly && (
                <div style={{ 
                  fontSize: '0.875rem',
                  padding: 'var(--space-2)',
                  background: 'var(--color-bg)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--color-border)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Sizes</span>
                    <span style={{ fontWeight: 600 }}>
                      {Object.values(safeCounts).reduce((a: number, b: number) => a + b, 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })
      ))}
      {readOnly && (
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
            <span>{Object.values(shirtColorComboVersion).reduce((sum: number, qty) => sum + Number(qty || 0), 0) as React.ReactNode}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShirtColorVersionCard; 