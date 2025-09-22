import React from 'react';
import { getProductName, getImagePath, getColorDisplayName, getQuantityMultiples } from '../../utils';
import { ColorVersion } from '../../../types';
import { Field } from '../../../components/ui';

interface ColorVersionCardProps {
  categoryPath: string;
  imageName: string;
  colorVersions?: ColorVersion;
  availableColors?: string[];
  onColorVersionChange?: (imagePath: string, color: keyof ColorVersion, value: string) => void;
  readOnly?: boolean;
  hideImage?: boolean;
  college?: string;
}

const ColorVersionCard: React.FC<ColorVersionCardProps> = ({
  categoryPath,
  imageName,
  colorVersions = { black: '', forest: '', white: '', gray: '' },
  availableColors = ['black', 'forest'],
  onColorVersionChange,
  readOnly = false,
  hideImage = false,
  college
}) => {
  const imagePath = getImagePath(categoryPath, imageName);
  const productName = getProductName(imageName);
  const totalQuantity = Object.values(colorVersions).reduce((sum: number, qty) => sum + Number(qty || 0), 0);

  const handleColorChange = (color: keyof ColorVersion, value: string) => {
    onColorVersionChange?.(imagePath, color, value);
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
      
      {availableColors.map((color) => {
        const colorKey = color as keyof ColorVersion;
        const displayName = getColorDisplayName(color);
        
            return (
              <Field key={color} label={displayName} htmlFor={`${color}-${imagePath}`}>
                <Field.Select
                  id={`${color}-${imagePath}`}
                  value={colorVersions[colorKey] || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleColorChange(colorKey, e.target.value)}
                  disabled={readOnly}
                >
                  <option value="">Select</option>
                  {getQuantityMultiples(imageName, categoryPath).map(val => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </Field.Select>
              </Field>
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
          {availableColors.map((color) => {
            const colorKey = color as keyof ColorVersion;
            const displayName = getColorDisplayName(color);
            const quantity = colorVersions[colorKey] || '';
            
            return (
              <div key={color} style={{
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
            <span>{totalQuantity as React.ReactNode}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorVersionCard; 