import React from 'react';
import { getProductName, getImagePath, getShirtVersionTotal, getVersionDisplayName, getSizeOptions } from '../../utils';
import { ShirtVersion, SizeCounts, Size } from '../../../types';
import { Field } from '../../../components/ui';
import { asset, getCollegeFolderName } from '../../../utils/asset';
import SizePackSelector from './SizePackSelector';

interface ShirtVersionCardProps {
  categoryPath: string;
  imageName: string;
  sizeCountsByVersion?: Partial<Record<keyof ShirtVersion, SizeCounts>>;
  availableVersions?: string[];
  onShirtVersionChange?: (imagePath: string, version: keyof ShirtVersion, value: string) => void;
  onSizeCountsChange?: (imagePath: string, version: keyof ShirtVersion, counts: SizeCounts) => void;
  readOnly?: boolean;
  hideImage?: boolean;
  college?: string;
}

const ShirtVersionCard: React.FC<ShirtVersionCardProps> = ({
  categoryPath,
  imageName,
  sizeCountsByVersion = {},
  availableVersions = ['tshirt'],
  onShirtVersionChange,
  onSizeCountsChange,
  readOnly = false,
  hideImage = false,
  college
}) => {
  const imagePath = getImagePath(categoryPath, imageName);
  const productName = getProductName(imageName);
  const totalQuantity = availableVersions.reduce((sum, v) => {
    const vc = sizeCountsByVersion[v as keyof ShirtVersion];
    const vTotal = vc ? Object.values(vc).reduce((a, b) => a + b, 0) : 0;
    return sum + vTotal;
  }, 0);

  const handleVersionChange = (version: keyof ShirtVersion, value: string) => {
    onShirtVersionChange?.(imagePath, version, value);
  };

  return (
    <div style={{ 
      background: 'var(--color-bg)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-2)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)'
    }}>
      {!hideImage && (
        <img
          src={asset(`${getCollegeFolderName(college || '')}/${imagePath}`)}
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
        const counts: SizeCounts = sizeCountsByVersion?.[versionKey] || { S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0 } as SizeCounts;
        const sizesArray = getSizeOptions(categoryPath, version);

        return (
          <div key={version}>
            {availableVersions.length > 1 && (
              <Field label={displayName} htmlFor={`${version}-${imagePath}`}>
                {null}
              </Field>
            )}
            {!readOnly && (
              <SizePackSelector
                counts={counts}
                sizes={sizesArray}
                onChange={(c) => onSizeCountsChange?.(imagePath, versionKey, c)}
              />
            )}
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
            const counts = sizeCountsByVersion?.[versionKey];
            const quantity = counts ? Object.values(counts).reduce((a,b)=>a+b,0) : 0;
            return (
              <div key={version} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                <span>{displayName}:</span>
                <span style={{ fontWeight: '500' }}>{quantity}</span>
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