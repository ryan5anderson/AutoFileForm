import React from 'react';
import { getProductName, getImagePath, getColorDisplayName } from '../utils';
import { ColorVersion } from '../types';

interface ColorVersionCardProps {
  categoryPath: string;
  imageName: string;
  colorVersions?: ColorVersion;
  availableColors?: string[];
  onColorVersionChange?: (imagePath: string, color: keyof ColorVersion, value: string) => void;
  readOnly?: boolean;
}

const ColorVersionCard: React.FC<ColorVersionCardProps> = ({
  categoryPath,
  imageName,
  colorVersions = { black: '', forest: '', white: '', gray: '' },
  availableColors = ['black', 'forest'],
  onColorVersionChange,
  readOnly = false
}) => {
  const imagePath = getImagePath(categoryPath, imageName);
  const productName = getProductName(imageName);
  const totalQuantity = Object.values(colorVersions).reduce((sum, qty) => sum + Number(qty || 0), 0);

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
          {availableColors.map((color) => {
            const colorKey = color as keyof ColorVersion;
            const displayName = getColorDisplayName(color);
            
            return (
              <div key={color} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                gap: 'var(--space-2)' 
              }}>
                <label 
                  htmlFor={`${color}-${imagePath}`} 
                  style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '600',
                    color: 'var(--color-text)',
                    minWidth: '60px'
                  }}
                >
                  {displayName}:
                </label>
                <input
                  type="number"
                  id={`${color}-${imagePath}`}
                  min="0"
                  value={colorVersions[colorKey] || ''}
                  onChange={(e) => handleColorChange(colorKey, e.target.value)}
                  style={{
                    width: '50px',
                    padding: 'var(--space-1) var(--space-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.75rem',
                    background: 'var(--color-input-bg)',
                    textAlign: 'center'
                  }}
                />
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
            <span>{totalQuantity}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorVersionCard; 