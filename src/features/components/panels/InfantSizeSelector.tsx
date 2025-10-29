import React from 'react';

import { InfantSize, InfantSizeCounts } from '../../../types';

interface InfantSizeSelectorProps {
  label?: string;
  counts: InfantSizeCounts;
  onChange: (counts: InfantSizeCounts) => void;
  packSize?: number;
  disabled?: boolean;
  allowAnyQuantity?: boolean;
  hideTotal?: boolean;
}

const INFANT_SIZES: InfantSize[] = ['6M', '12M'];

const InfantSizeSelector: React.FC<InfantSizeSelectorProps> = ({
  label,
  counts,
  onChange,
  packSize = 6,
  disabled = false,
  allowAnyQuantity = false,
  hideTotal = false,
}) => {
  const total = (counts['6M'] || 0) + (counts['12M'] || 0);
  const needed = total > 0 ? (packSize - (total % packSize)) % packSize : packSize;
  const isValid = total > 0 && (total % packSize === 0);

  const handleDelta = (size: InfantSize, delta: number) => {
    if (disabled) return;
    const next: InfantSizeCounts = { ...counts, [size]: Math.max(0, (counts[size] || 0) + delta) };
    onChange(next);
  };

  const handleInput = (size: InfantSize, value: string) => {
    const numeric = Math.max(0, Number(value.replace(/[^0-9]/g, '')) || 0);

    // If allowAnyQuantity is true, allow any quantity. Otherwise, round to nearest multiple of packSize.
    const adjustedValue = allowAnyQuantity ? numeric : Math.round(numeric / packSize) * packSize;

    const next: InfantSizeCounts = { ...counts, [size]: adjustedValue };
    onChange(next);
  };

  const handleClear = () => {
    const cleared: InfantSizeCounts = { '6M': 0, '12M': 0 };
    onChange(cleared);
  };

  const handleEvenSplit = () => {
    const base = Math.floor(packSize / INFANT_SIZES.length);
    const remainder = packSize % INFANT_SIZES.length;
    const distribution = INFANT_SIZES.map((_, idx) => base + (idx < remainder ? 1 : 0));
    const next: InfantSizeCounts = { ...counts };
    INFANT_SIZES.forEach((s: InfantSize, idx: number) => {
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
          gridTemplateColumns: `repeat(${INFANT_SIZES.length}, minmax(0, 1fr))`,
          gap: '0.4rem',
          alignItems: 'stretch',
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          boxSizing: 'border-box'
        }}
      >
        {INFANT_SIZES.map((size: InfantSize) => (
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
            color: allowAnyQuantity ? 'var(--color-text)' : (total > 0 && !isValid ? 'var(--color-danger)' : isValid ? 'var(--color-success)' : undefined)
          }}
          role="status"
          aria-live="polite"
          data-valid={allowAnyQuantity ? 'true' : (isValid ? 'true' : 'false')}
          data-positive={total > 0 ? 'true' : 'false'}
        >
          {allowAnyQuantity ? (
            <>Total: {total} items</>
          ) : (
            <>Total: {total} items • Add {isValid ? packSize : needed} more to complete a pack of {packSize}.</>
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

export default InfantSizeSelector;

