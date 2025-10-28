import React from 'react';

import { Size, SizeCounts } from '../../../types';
import { calcTotals } from '../../utils';

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

const SizePackSelector: React.FC<SizePackSelectorProps> = ({
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
    <div className="size-pack" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'hidden', boxSizing: 'border-box' }}>
      {label ? (
        <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      ) : null}
      <div className="size-pack__grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${SIZE_LIST.length}, minmax(0, 1fr))`,
          gap: '0.4rem',
          alignItems: 'stretch',
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          boxSizing: 'border-box'
        }}
      >
        {SIZE_LIST.map((size: Size) => (
          <div key={size} className="size-pack__cell">
            <div className="size-pack__cell-content">
              <button type="button" className="size-pack__btn" onClick={() => handleDelta(size, +1)} aria-label={`Increase ${size}`} disabled={disabled}>+</button>
              <div className="size-pack__label">{size}</div>
              <input
                aria-label={`${size} quantity`}
                inputMode="numeric"
                pattern="[0-9]*"
                value={counts[size] || 0}
                onChange={(e) => handleInput(size, e.target.value)}
                disabled={disabled}
                className="size-pack__input"
              />
              <button type="button" className="size-pack__btn" onClick={() => handleDelta(size, -1)} aria-label={`Decrease ${size}`} disabled={disabled}>-</button>
            </div>
          </div>
        ))}
      </div>

      {!hideTotal && (
        <div
          className="size-pack__helper"
          style={{
            width: '100%',
            maxWidth: '100%',
            color: allowAnyQuantity ? 'var(--color-text)' : (totals.total > 0 && !totals.isValid ? 'var(--color-danger)' : totals.isValid ? 'var(--color-success)' : undefined)
          }}
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

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%', maxWidth: '100%' }}>
        <button type="button" className="btn-ghost-sm" onClick={handleClear}>Clear</button>
        <button type="button" className="btn-ghost-sm" onClick={handleEvenSplit}>Pack of {packSize}</button>
      </div>
    </div>
  );
};

export default SizePackSelector;



