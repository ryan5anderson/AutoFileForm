import React from 'react';
import SizePackSelector from './SizePackSelector';
import { SizeCounts, Size } from '../../../../shared/types';
import { getColorDisplayName } from '../../utils';
import styles from './ColorSizeSelector.module.css';

interface ColorSizeSelectorProps {
  colors: string[];
  colorSizeCounts: Record<string, SizeCounts>;
  onChange: (color: string, counts: SizeCounts) => void;
  sizes?: Size[];
  disabled?: boolean;
  packSize?: number;
  allowAnyQuantity?: boolean;
  gap?: string;
}

const ColorSizeSelector: React.FC<ColorSizeSelectorProps> = ({
  colors,
  colorSizeCounts,
  onChange,
  sizes,
  disabled = false,
  packSize = 7,
  allowAnyQuantity = false,
  gap
}) => {
  // Use side-by-side layout for 2 colors, stacked for more
  const useSideBySide = colors.length === 2;
  
  // Create dynamic style props for CSS custom properties
  const dynamicStyles = {
    ...(gap && { '--color-size-gap': gap })
  } as React.CSSProperties;
  
  return (
    <div 
      className={`${styles.colorSizeSelector} ${useSideBySide ? styles['colorSizeSelector--sideBySide'] : styles['colorSizeSelector--stacked']} ${gap ? styles['colorSizeSelector--dynamic'] : ''}`}
      style={dynamicStyles}
    >
      {colors.map((color) => (
        <div key={color} className={styles.colorSizeSelector__colorOption}>
          <div className={styles.colorSizeSelector__colorLabel}>
            {getColorDisplayName(color)}
          </div>
          <SizePackSelector
            counts={colorSizeCounts[color] || { S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0, SM: 0 }}
            onChange={(counts) => onChange(color, counts)}
            sizes={sizes}
            disabled={disabled}
            packSize={packSize}
            allowAnyQuantity={allowAnyQuantity}
          />
        </div>
      ))}
    </div>
  );
};

export default ColorSizeSelector;

