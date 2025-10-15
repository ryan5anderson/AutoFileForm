import React from 'react';
import clsx from 'clsx';
import QuantityStepper from './QuantityStepper';
import { getColorDisplayName } from '../../utils';
import styles from './ColorQuantitySelector.module.css';

interface ColorQuantitySelectorProps {
  colors: string[];
  colorQuantities: Record<string, string>;
  onChange: (color: string, value: string) => void;
  disabled?: boolean;
  packSize?: number;
  gap?: string;
}

const ColorQuantitySelector: React.FC<ColorQuantitySelectorProps> = ({
  colors,
  colorQuantities,
  onChange,
  disabled = false,
  packSize = 1,
  gap
}) => {
  // Use side-by-side layout for 2 colors, stacked for more
  const useSideBySide = colors.length === 2;
  
  // Create dynamic style props for CSS custom properties
  const dynamicStyles = {
    ...(gap && { '--color-quantity-gap': gap })
  } as React.CSSProperties;
  
  return (
    <div 
      className={clsx(
        styles.colorQuantitySelector,
        useSideBySide ? styles['colorQuantitySelector--sideBySide'] : styles['colorQuantitySelector--stacked'],
        gap && styles['colorQuantitySelector--dynamic']
      )}
      style={dynamicStyles}
    >
      {colors.map((color) => (
        <div key={color} className={clsx('field', styles.colorQuantitySelector__colorField)}>
          <div className={clsx('field-label', styles.colorQuantitySelector__colorLabel)}>
            {getColorDisplayName(color)}
          </div>
          <div className="field-control">
            <QuantityStepper
              value={Number(colorQuantities[color] || 0)}
              onChange={(v) => onChange(color, String(v))}
              disabled={disabled}
              ariaLabel={`${getColorDisplayName(color)} Quantity`}
              step={packSize}
            />
            {packSize > 1 && (
              <div className={styles.colorQuantitySelector__packInfo}>
                Sold in packs of {packSize}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ColorQuantitySelector;

