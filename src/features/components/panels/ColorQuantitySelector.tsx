import React from 'react';

import { getColorDisplayName } from '../../utils';

import QuantityStepper from './QuantityStepper';

interface ColorQuantitySelectorProps {
  colors: string[];
  colorQuantities: Record<string, string>;
  onChange: (color: string, value: string) => void;
  disabled?: boolean;
  packSize?: number;
}

const ColorQuantitySelector: React.FC<ColorQuantitySelectorProps> = ({
  colors,
  colorQuantities,
  onChange,
  disabled = false,
  packSize = 1
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
        <div key={color} className="field" style={{
          flex: useSideBySide ? '1' : undefined,
          minWidth: 0
        }}>
          <div className="field-label" style={{
            fontSize: '0.8rem',
            marginBottom: '0.35rem'
          }}>
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
      ))}
    </div>
  );
};

export default ColorQuantitySelector;

