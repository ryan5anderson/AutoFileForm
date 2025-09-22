import React from 'react';
import { getProductName, getImagePath, getRackDisplayName, getQuantityMultiples } from '../../utils';
import { SweatpantJoggerOption } from '../../../types';

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

  // When hideImage is true (used in configuration panel), return just the field structure
  if (hideImage) {
    return (
      <>
        {showQuantityInput && (
          <>
            {categoryName === 'Sweatpants/Joggers' ? (
              <>
                {['sweatpantSteel', 'sweatpantOxford', 'joggerSteel', 'joggerOxford'].map((optionKey) => (
                  <div key={optionKey} className="field">
                    <div className="field-label">
                      {optionKey === 'sweatpantSteel' && 'Straight-Leg Steel'}
                      {optionKey === 'sweatpantOxford' && 'Straight-Leg Oxford'}
                      {optionKey === 'joggerSteel' && 'Jogger Steel'}
                      {optionKey === 'joggerOxford' && 'Jogger Oxford'}
                    </div>
                    <div className="field-control">
                      <select
                        id={`${optionKey}-${imagePath}`}
                        value={(sweatpantJoggerOption ? sweatpantJoggerOption[optionKey as keyof SweatpantJoggerOption] : '') || ''}
                        onChange={e => onSweatpantJoggerOptionChange && onSweatpantJoggerOptionChange(imagePath, optionKey as keyof SweatpantJoggerOption, e.target.value)}
                        disabled={readOnly}
                      >
                        <option value="">Select</option>
                        {getQuantityMultiples(imageName, 'Sweatpants/Joggers').map(val => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </>
            ) : (categoryName === 'Display Options' || categoryName === 'Water Bottle') ? (
              <div className="field">
                <div className="field-label">Quantity</div>
                <div className="field-control">
                  <input
                    type="number"
                    inputMode="numeric"
                    id={`qty-${imagePath}`}
                    min="0"
                    value={quantity || ''}
                    onChange={(e) => onQuantityChange?.(imagePath, e.target.value)}
                    disabled={readOnly}
                  />
                </div>
              </div>
            ) : (
              <div className="field">
                <div className="field-label">Quantity</div>
                <div className="field-control">
                  <select
                    id={`qty-${imagePath}`}
                    value={quantity}
                    onChange={(e) => onQuantityChange?.(imagePath, e.target.value)}
                    disabled={readOnly}
                  >
                    <option value="">Select</option>
                    {getQuantityMultiples(imageName, categoryName).map(val => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </>
        )}
      </>
    );
  }

  // Regular card view with image and container styling
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
        src={process.env.PUBLIC_URL + `/${college === 'arizonastate' ? 'ArizonaState' : 'MichiganState'}/${imagePath}`}
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
      {showQuantityInput && (
        <>
          {categoryName === 'Sweatpants/Joggers' ? (
            <>
              {['sweatpantSteel', 'sweatpantOxford', 'joggerSteel', 'joggerOxford'].map((optionKey) => (
                <div key={optionKey} className="field">
                  <div className="field-label">
                    {optionKey === 'sweatpantSteel' && 'Straight-Leg Steel'}
                    {optionKey === 'sweatpantOxford' && 'Straight-Leg Oxford'}
                    {optionKey === 'joggerSteel' && 'Jogger Steel'}
                    {optionKey === 'joggerOxford' && 'Jogger Oxford'}
                  </div>
                  <div className="field-control">
                    <select
                      id={`${optionKey}-${imagePath}`}
                      value={(sweatpantJoggerOption ? sweatpantJoggerOption[optionKey as keyof SweatpantJoggerOption] : '') || ''}
                      onChange={e => onSweatpantJoggerOptionChange && onSweatpantJoggerOptionChange(imagePath, optionKey as keyof SweatpantJoggerOption, e.target.value)}
                      disabled={readOnly}
                    >
                      <option value="">Select</option>
                      {getQuantityMultiples(imageName, 'Sweatpants/Joggers').map(val => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </>
          ) : (categoryName === 'Display Options' || categoryName === 'Water Bottle') ? (
            <div className="field">
              <div className="field-label">Quantity</div>
              <div className="field-control">
                <input
                  type="number"
                  inputMode="numeric"
                  id={`qty-${imagePath}`}
                  min="0"
                  value={quantity || ''}
                  onChange={(e) => onQuantityChange?.(imagePath, e.target.value)}
                  disabled={readOnly}
                />
              </div>
            </div>
          ) : (
            <div className="field">
              <div className="field-label">Quantity</div>
              <div className="field-control">
                <select
                  id={`qty-${imagePath}`}
                  value={quantity}
                  onChange={(e) => onQuantityChange?.(imagePath, e.target.value)}
                  disabled={readOnly}
                >
                  <option value="">Select</option>
                  {getQuantityMultiples(imageName, categoryName).map(val => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </>
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