import React from 'react';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

const QuantityStepper: React.FC<QuantityStepperProps> = ({ value, onChange, disabled = false, ariaLabel }) => {
  const handleDelta = (d: number) => {
    const next = Math.max(0, value + d);
    onChange(next);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = Math.max(0, Number(e.target.value.replace(/[^0-9]/g, '')) || 0);
    onChange(n);
  };

  return (
    <div className="size-pack" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', maxWidth: '260px' }}>
      <button
        type="button"
        className="size-pack__btn"
        aria-label={ariaLabel ? `Decrease ${ariaLabel}` : 'Decrease quantity'}
        onClick={() => handleDelta(-1)}
        disabled={disabled}
        style={{ height: '1.75rem', width: '1.75rem' }}
      >
        -
      </button>
      <input
        className="size-pack__input"
        aria-label={ariaLabel ? `${ariaLabel} quantity` : 'Quantity'}
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleInput}
        disabled={disabled}
        style={{ height: '1.75rem', width: '4rem' }}
      />
      <button
        type="button"
        className="size-pack__btn"
        aria-label={ariaLabel ? `Increase ${ariaLabel}` : 'Increase quantity'}
        onClick={() => handleDelta(+1)}
        disabled={disabled}
        style={{ height: '1.75rem', width: '1.75rem' }}
      >
        +
      </button>
    </div>
  );
};

export default QuantityStepper;


