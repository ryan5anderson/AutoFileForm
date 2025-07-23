import React from 'react';
import { getProductName, getImagePath, getRackDisplayName, getQuantityMultiples } from '../utils';
import { SweatpantJoggerOption } from '../types';

interface ProductCardProps {
  categoryPath: string;
  categoryName: string;
  imageName: string;
  quantity?: string;
  onQuantityChange?: (imagePath: string, value: string) => void;
  showQuantityInput?: boolean;
  readOnly?: boolean;
  sweatpantJoggerOption?: SweatpantJoggerOption;
  onSweatpantJoggerOptionChange?: (imagePath: string, option: keyof SweatpantJoggerOption, value: string) => void;
  hideImage?: boolean;
  college?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  categoryPath,
  categoryName,
  imageName,
  quantity = '',
  onQuantityChange,
  showQuantityInput = true,
  readOnly = false,
  sweatpantJoggerOption,
  onSweatpantJoggerOptionChange,
  hideImage = false,
  college
}) => {
  const imagePath = getImagePath(categoryPath, imageName);
  const productName = categoryName === 'Display Options' ? getRackDisplayName(imageName) : getProductName(imageName);

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
      {showQuantityInput && !readOnly && (
        <div style={{ 
          display: 'flex', 
          flexDirection: categoryName === 'Sweatpants/Joggers' ? 'column' : 'row',
          alignItems: categoryName === 'Sweatpants/Joggers' ? 'flex-start' : 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)'
        }}>
          {categoryName === 'Sweatpants/Joggers' ? (
            <>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '4px' }}>Quantity:</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {['sweatpantSteel', 'sweatpantOxford', 'joggerSteel', 'joggerOxford'].map((optionKey) => (
                  <div key={optionKey} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', width: '100%' }}>
                    <span style={{ fontSize: '0.875rem', marginRight: '8px' }}>
                      {optionKey === 'sweatpantSteel' && 'Straight-Leg Steel:'}
                      {optionKey === 'sweatpantOxford' && 'Straight-Leg Oxford:'}
                      {optionKey === 'joggerSteel' && 'Jogger Steel:'}
                      {optionKey === 'joggerOxford' && 'Jogger Oxford:'}
                    </span>
                    <select
                      id={`${optionKey}-${imagePath}`}
                      value={(sweatpantJoggerOption ? sweatpantJoggerOption[optionKey as keyof SweatpantJoggerOption] : '') || ''}
                      onChange={e => onSweatpantJoggerOptionChange && onSweatpantJoggerOptionChange(imagePath, optionKey as keyof SweatpantJoggerOption, e.target.value)}
                      style={{
                        width: '120px',
                        padding: 'var(--space-2)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.875rem',
                        background: 'var(--color-input-bg)',
                        textAlign: 'center'
                      }}
                    >
                      <option value="">Select</option>
                      {getQuantityMultiples(imageName, 'Sweatpants/Joggers').map(val => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </>
          ) : (categoryName === 'Display Options' || categoryName === 'Water Bottle') ? (
            <>
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
                  width: '80px',
                  padding: 'var(--space-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.875rem',
                  background: 'var(--color-input-bg)',
                  textAlign: 'center'
                }}
              />
            </>
          ) : (
            <>
              <label htmlFor={`qty-${imagePath}`} style={{ 
                fontSize: '0.875rem', 
                fontWeight: '600',
                color: 'var(--color-text)'
              }}>
                Quantity:
              </label>
              <select
                id={`qty-${imagePath}`}
                value={quantity}
                onChange={(e) => onQuantityChange?.(imagePath, e.target.value)}
                style={{
                  width: '80px',
                  padding: 'var(--space-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.875rem',
                  background: 'var(--color-input-bg)',
                  textAlign: 'center'
                }}
              >
                <option value="">Select</option>
                {getQuantityMultiples(imageName, categoryName).map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </>
          )}
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