import React from 'react';
import { Size, SizeCounts } from '../../../../shared/types';
import { calcTotals } from '../../utils';
import styles from './Panel.module.css';

const ALL_SIZES_DEFAULT: Size[] = ['S', 'M', 'L', 'XL', 'XXL'];

interface SizePackSelectorProps {
  label?: string;
  counts: SizeCounts;
  onChange: (counts: SizeCounts) => void;
  packSize?: number;
  disabled?: boolean;
  sizes?: Size[];
  allowAnyQuantity?: boolean;
  hideTotal?: boolean;
}

export const SizePackSelector: React.FC<SizePackSelectorProps> = ({
  label,
  counts,
  onChange,
  packSize = 7,
  disabled = false,
  sizes,
  allowAnyQuantity = false,
  hideTotal = false,
}) => {
  const totals = calcTotals(counts, packSize, allowAnyQuantity);
  const SIZE_LIST: Size[] = sizes && sizes.length > 0 ? sizes : ALL_SIZES_DEFAULT;

  const handleDelta = (size: Size, delta: number) => {
    if (disabled) return;
    // Use single unit increment/decrement for better UX, validation happens in input
    const next: SizeCounts = { ...counts, [size]: Math.max(0, (counts[size] || 0) + delta) } as SizeCounts;
    onChange(next);
  };

  const handleInput = (size: Size, value: string) => {
    const numeric = Math.max(0, Number(value.replace(/[^0-9]/g, '')) || 0);

    // If allowAnyQuantity is true, allow any quantity. Otherwise, round to nearest multiple of packSize.
    const adjustedValue = allowAnyQuantity ? numeric : Math.round(numeric / packSize) * packSize;

    const next: SizeCounts = { ...counts, [size]: adjustedValue } as SizeCounts;
    onChange(next);
  };

  const handleClear = () => {
    const cleared = SIZE_LIST.reduce((acc: SizeCounts, s: Size) => ({ ...acc, [s]: 0 }), {} as SizeCounts);
    onChange(cleared);
  };

  const handleEvenSplit = () => {
    const base = Math.floor(packSize / SIZE_LIST.length);
    const remainder = packSize % SIZE_LIST.length;
    const distribution = SIZE_LIST.map((_, idx) => base + (idx < remainder ? 1 : 0));
    const next: SizeCounts = { ...counts } as SizeCounts;
    SIZE_LIST.forEach((s: Size, idx: number) => {
      next[s] = (next[s] || 0) + distribution[idx];
    });
    onChange(next);
  };

  return (
    <div className={styles.sizePackContainer}>
      {label ? (
        <div className={styles.sizePackLabel}>{label}</div>
      ) : null}
      <div 
        className={styles.sizePackGrid}
        data-size-count={SIZE_LIST.length}
      >
        {SIZE_LIST.map((size: Size) => (
          <div key={size} className={styles.sizePackCell}>
            <div className={styles.sizePackCellContent}>
              <button 
                type="button" 
                className={styles.sizePackButton} 
                onClick={() => handleDelta(size, +1)} 
                aria-label={`Increase ${size}`} 
                disabled={disabled}
              >
                +
              </button>
              <div className={styles.sizeLabel}>{size}</div>
              <input
                id={`size-${size}-${Math.random().toString(36).substr(2, 9)}`}
                aria-label={`${size} quantity`}
                inputMode="numeric"
                pattern="[0-9]*"
                value={counts[size] || 0}
                onChange={(e) => handleInput(size, e.target.value)}
                disabled={disabled}
                className={styles.sizeInput}
                autoComplete="off"
                name={`size-${size}`}
                type="number"
                min="0"
              />
              <button 
                type="button" 
                className={styles.sizePackButton} 
                onClick={() => handleDelta(size, -1)} 
                aria-label={`Decrease ${size}`} 
                disabled={disabled}
              >
                -
              </button>
            </div>
          </div>
        ))}
      </div>

      {!hideTotal && (
        <div
          className={styles.sizePackHelper}
          role="status"
          aria-live="polite"
          data-valid={allowAnyQuantity ? 'true' : (totals.isValid ? 'true' : 'false')}
          data-positive={totals.total > 0 ? 'true' : 'false'}
        >
          {allowAnyQuantity ? (
            <>Total: {totals.total} items</>
          ) : (
            <>Total: {totals.total} items • Add {totals.isValid ? packSize : totals.needed} more to complete a pack of {packSize}.</>
          )}
        </div>
      )}

      <div className={styles.sizePackActions}>
        <button type="button" className="btn-ghost-sm" onClick={handleClear}>Clear</button>
        <button type="button" className="btn-ghost-sm" onClick={handleEvenSplit}>Pack of {packSize}</button>
      </div>
    </div>
  );
};

export default SizePackSelector;



