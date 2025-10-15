import React from 'react';
import { getProductName, getImagePath, getShirtVersionTotal, getVersionDisplayName, getSizeOptions } from '../../utils';
import { ShirtVersion, SizeCounts, Size } from '../../../../shared/types';
import Field from '../../../../shared/ui/Field';
import { asset, getCollegeFolderName } from '../../../../shared/utils/asset';
import { getPackSize, allowsAnyQuantity } from '../../../../config/packSizes';
import SizePackSelector from './SizePackSelector';
import styles from './ShirtVersionPanel.module.css';

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
  gap?: string;
  padding?: string;
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
  college,
  gap,
  padding
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

  // Create dynamic style props for CSS custom properties
  const dynamicStyles = {
    ...(gap && { '--shirt-version-gap': gap }),
    ...(padding && { '--shirt-version-padding': padding })
  } as React.CSSProperties;

  return (
    <div 
      className={`${styles.shirtVersionCard} ${gap || padding ? styles['shirtVersionCard--dynamic'] : ''}`}
      style={dynamicStyles}
    >
      {!hideImage && (
        <img
          src={asset(`${getCollegeFolderName(college || '')}/${imagePath}`)}
          alt={imageName}
          className={styles.shirtVersionCard__image}
        />
      )}
      {!hideImage && (
        <div className={styles.shirtVersionCard__productName}>
          {productName}
        </div>
      )}
      
      <div className={styles.shirtVersionCard__versionSection}>
        {availableVersions.map((version) => {
          const versionKey = version as keyof ShirtVersion;
          const displayName = getVersionDisplayName(version, imageName);
          const counts: SizeCounts = sizeCountsByVersion?.[versionKey] || { S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0, SM: 0 } as SizeCounts;
          const sizesArray = getSizeOptions(categoryPath, version);
          const packSize = getPackSize(categoryPath, version, imageName);

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
                  packSize={packSize}
                  allowAnyQuantity={allowsAnyQuantity(categoryPath, version, imageName)}
                />
              )}
            </div>
          );
        })}
      </div>
      {readOnly && (
        <div className={styles.shirtVersionCard__readOnlyInfo}>
          {availableVersions.map((version) => {
            const versionKey = version as keyof ShirtVersion;
            const displayName = getVersionDisplayName(version, imageName);
            const counts = sizeCountsByVersion?.[versionKey];
            const quantity = counts ? Object.values(counts).reduce((a,b)=>a+b,0) : 0;
            return (
              <div key={version} className={styles.shirtVersionCard__readOnlyRow}>
                <span className={styles.shirtVersionCard__readOnlyLabel}>{displayName}:</span>
                <span className={styles.shirtVersionCard__readOnlyValue}>{quantity}</span>
              </div>
            );
          })}
          <div className={styles.shirtVersionCard__readOnlyTotal}>
            <span>Total:</span>
            <span>{totalQuantity}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShirtVersionCard; 