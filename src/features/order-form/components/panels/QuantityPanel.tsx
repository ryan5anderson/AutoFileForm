import React from 'react';
import { getProductName, getImagePath, getRackDisplayName, getQuantityMultiples } from '../../utils';
import { SweatpantJoggerOption } from '../../../../shared/types';
import { asset, getCollegeFolderName } from '../../../../shared/utils/asset';
import { getPackSize } from '../../../../config/packSizes';
import QuantityStepper from './QuantityStepper';

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
  const packSize = getPackSize(categoryPath, undefined, imageName);

  // When hideImage is true (used in configuration panel), return just the field structure
  if (hideImage) {
    return (
      <>
        {showQuantityInput && (
          <>
            {categoryName === 'Sweatpants/Joggers' ? (
              <>
                {['sweatpantSteel', 'sweatpantBlack', 'sweatpantDarkNavy', 'joggerSteel', 'joggerDarkHeather'].map((optionKey) => (
                  <div key={optionKey} className="field">
                    <label className="field-label" htmlFor={`${optionKey}-${imagePath}`}>
                      {optionKey === 'sweatpantSteel' && 'Straight-Leg Steel'}
                      {optionKey === 'sweatpantBlack' && 'Straight-Leg Black'}
                      {optionKey === 'sweatpantDarkNavy' && 'Straight-Leg Dark Navy'}
                      {optionKey === 'joggerSteel' && 'Jogger Steel'}
                      {optionKey === 'joggerDarkHeather' && 'Jogger Dark Heather'}
                    </label>
                    <div className="field-control">
                      <select
                        id={`${optionKey}-${imagePath}`}
                        value={(sweatpantJoggerOption ? sweatpantJoggerOption[optionKey as keyof SweatpantJoggerOption] : '') || ''}
                        onChange={e => onSweatpantJoggerOptionChange && onSweatpantJoggerOptionChange(imagePath, optionKey as keyof SweatpantJoggerOption, e.target.value)}
                        disabled={readOnly}
                        autoComplete="off"
                        name={`${optionKey}-${imagePath}`}
                      >
                        <option value="">Select</option>
                        {getQuantityMultiples(imageName, 'Sweatpants/Joggers', categoryPath, undefined).map(val => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="field">
                <label className="field-label" htmlFor={`quantity-${imagePath}`}>Quantity</label>
                <div className="field-control">
                  <QuantityStepper
                    value={Number(quantity || 0)}
                    onChange={(v) => onQuantityChange?.(imagePath, String(v))}
                    disabled={readOnly}
                    ariaLabel={productName}
                    step={packSize}
                    inputId={`quantity-${imagePath}`}
                  />
                  {packSize > 1 && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                      marginTop: '0.25rem'
                    }}>
                      Sold in packs of {packSize}
                    </div>
                  )}
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
        src={asset(`${getCollegeFolderName(college || '')}/${imagePath}`)}
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
              {['sweatpantSteel', 'sweatpantBlack', 'sweatpantDarkNavy', 'joggerSteel', 'joggerDarkHeather'].map((optionKey) => (
                <div key={optionKey} className="field">
                  <label className="field-label" htmlFor={`${optionKey}-${imagePath}-card`}>
                    {optionKey === 'sweatpantSteel' && 'Straight-Leg Steel'}
                    {optionKey === 'sweatpantBlack' && 'Straight-Leg Black'}
                    {optionKey === 'sweatpantDarkNavy' && 'Straight-Leg Dark Navy'}
                    {optionKey === 'joggerSteel' && 'Jogger Steel'}
                    {optionKey === 'joggerDarkHeather' && 'Jogger Dark Heather'}
                  </label>
                  <div className="field-control">
                    <select
                      id={`${optionKey}-${imagePath}-card`}
                      value={(sweatpantJoggerOption ? sweatpantJoggerOption[optionKey as keyof SweatpantJoggerOption] : '') || ''}
                      onChange={e => onSweatpantJoggerOptionChange && onSweatpantJoggerOptionChange(imagePath, optionKey as keyof SweatpantJoggerOption, e.target.value)}
                      disabled={readOnly}
                      autoComplete="off"
                      name={`${optionKey}-${imagePath}-card`}
                    >
                      <option value="">Select</option>
                      {getQuantityMultiples(imageName, 'Sweatpants/Joggers', categoryPath, undefined).map(val => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="field">
              <label className="field-label" htmlFor={`quantity-${imagePath}-card`}>Quantity</label>
              <div className="field-control">
                <QuantityStepper
                  value={Number(quantity || 0)}
                  onChange={(v) => onQuantityChange?.(imagePath, String(v))}
                  disabled={readOnly}
                  ariaLabel={productName}
                  step={packSize}
                  inputId={`quantity-${imagePath}-card`}
                />
                {packSize > 1 && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                    marginTop: '0.25rem'
                  }}>
                    Sold in packs of {packSize}
                  </div>
                )}
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