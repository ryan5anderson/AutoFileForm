import React from 'react';
import SizePackSelector from './SizePackSelector';
import { SizeCounts, Size } from '../../../types';
import { getColorDisplayName } from '../../utils';

interface ColorSizeSelectorProps {
  colors: string[];
  colorSizeCounts: Record<string, SizeCounts>;
  onChange: (color: string, counts: SizeCounts) => void;
  sizes?: Size[];
  disabled?: boolean;
  packSize?: number;
  allowAnyQuantity?: boolean;
}

const ColorSizeSelector: React.FC<ColorSizeSelectorProps> = ({
  colors,
  colorSizeCounts,
  onChange,
  sizes,
  disabled = false,
  packSize = 7,
  allowAnyQuantity = false,
}) => {
  // Use side-by-side layout for 2 colors, stacked for more
  const useSideBySide = colors.length === 2;
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: useSideBySide ? 'row' : 'column',
      gap: useSideBySide ? 'var(--space-3)' : 'var(--space-2)',
      width: '100%'
    }}>
      {colors.map((color) => (
        <div key={color} style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          padding: 'var(--space-2)',
          flex: useSideBySide ? '1' : undefined,
          minWidth: 0
        }}>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: '600',
            marginBottom: '0.35rem',
            color: 'var(--color-text)'
          }}>
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

