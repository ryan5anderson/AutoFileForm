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
}

export const SizePackSelector: React.FC<SizePackSelectorProps> = ({
  label,
  counts,
  onChange,
  packSize = 7,
  disabled = false,
  sizes,
}) => {
  const totals = calcTotals(counts, packSize);
  const SIZE_LIST: Size[] = sizes && sizes.length > 0 ? sizes : ALL_SIZES_DEFAULT;

  const handleDelta = (size: Size, delta: number) => {
    if (disabled) return;
    const next: SizeCounts = { ...counts, [size]: Math.max(0, (counts[size] || 0) + delta) } as SizeCounts;
    onChange(next);
  };

  const handleInput = (size: Size, value: string) => {
    const numeric = Math.max(0, Number(value.replace(/[^0-9]/g, '')) || 0);
    const next: SizeCounts = { ...counts, [size]: numeric } as SizeCounts;
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
          <div key={size} className="size-pack__cell" style={{ padding: '0.25rem', boxSizing: 'border-box', minWidth: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', width: '100%' }}>
              <button type="button" className="size-pack__btn" onClick={() => handleDelta(size, +1)} aria-label={`Increase ${size}`} disabled={disabled} style={{ height: '1.4rem', width: '1.4rem', fontSize: '0.8rem' }}>+</button>
              <div style={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: 1 }}>{size}</div>
              <input
                aria-label={`${size} quantity`}
                inputMode="numeric"
                pattern="[0-9]*"
                value={counts[size] || 0}
                onChange={(e) => handleInput(size, e.target.value)}
                disabled={disabled}
                className="size-pack__input"
                style={{ height: '1.4rem', width: '100%', maxWidth: '100%', minWidth: 0, padding: 0, margin: 0, fontSize: '0.8rem' }}
              />
              <button type="button" className="size-pack__btn" onClick={() => handleDelta(size, -1)} aria-label={`Decrease ${size}`} disabled={disabled} style={{ height: '1.4rem', width: '1.4rem', fontSize: '0.8rem' }}>-</button>
            </div>
          </div>
        ))}
      </div>

      <div
        className="size-pack__helper"
        style={{
          width: '100%',
          maxWidth: '100%',
          color: totals.total > 0 && !totals.isValid ? 'var(--color-danger)' : totals.isValid ? 'var(--color-success)' : undefined
        }}
        role="status"
        aria-live="polite"
        data-valid={totals.isValid ? 'true' : 'false'}
        data-positive={totals.total > 0 ? 'true' : 'false'}
      >
        {totals.isValid ? (
          <>Total: {totals.total} items • Packs: {totals.packs}</>
        ) : (
          <>Add {totals.needed} more to complete a pack of {packSize}.</>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%', maxWidth: '100%' }}>
        <button type="button" className="btn-ghost-sm" onClick={handleClear}>Clear</button>
        <button type="button" className="btn-ghost-sm" onClick={handleEvenSplit}>Split evenly</button>
      </div>
    </div>
  );
};

export default SizePackSelector;



