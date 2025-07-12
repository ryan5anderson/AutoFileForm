import React from 'react';
import { getProductName, getImagePath, getRackDisplayName } from '../utils';

interface ProductCardProps {
  categoryPath: string;
  categoryName: string;
  imageName: string;
  quantity?: string;
  onQuantityChange?: (imagePath: string, value: string) => void;
  showQuantityInput?: boolean;
  readOnly?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  categoryPath,
  categoryName,
  imageName,
  quantity = '',
  onQuantityChange,
  showQuantityInput = true,
  readOnly = false
}) => {
  const imagePath = getImagePath(categoryPath, imageName);
  const productName = categoryName === 'Rack' ? getRackDisplayName(imageName) : getProductName(imageName);

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
      {showQuantityInput && !readOnly && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 'var(--space-2)' 
        }}>
          <label htmlFor={`qty-${imagePath}`} style={{ 
            fontSize: '0.875rem', 
            fontWeight: '600',
            color: 'var(--color-text)'
          }}>
            Quantity:
          </label>
          <input
            type="number"
            id={`qty-${imagePath}`}
            min="0"
            value={quantity}
            onChange={(e) => onQuantityChange?.(imagePath, e.target.value)}
            style={{
              width: '60px',
              padding: 'var(--space-2)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
              background: 'var(--color-input-bg)',
              textAlign: 'center'
            }}
          />
        </div>
      )}
      {readOnly && (
        <div style={{ 
          fontWeight: '600', 
          fontSize: '0.875rem',
          textAlign: 'center',
          color: 'var(--color-primary)'
        }}>
          Quantity: {quantity || '0'}
        </div>
      )}
    </div>
  );
};

export default ProductCard; 