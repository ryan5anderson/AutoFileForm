import React from 'react';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  ariaLabel?: string;
  step?: number;
}

const QuantityStepper: React.FC<QuantityStepperProps> = ({ value, onChange, disabled = false, ariaLabel, step = 1 }) => {
  const handleDelta = (d: number) => {
    const next = Math.max(0, value + d * step);
    onChange(next);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Math.max(0, Number(e.target.value.replace(/[^0-9]/g, '')) || 0);
    const adjusted = step > 1 ? Math.floor(raw / step) * step : raw;
    onChange(adjusted);
  };

  return (
    <div className="size-pack" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', maxWidth: '100%' }}>
      <button
        type="button"
        className="size-pack__btn"
        aria-label={ariaLabel ? `Decrease ${ariaLabel}` : 'Decrease quantity'}
        onClick={() => handleDelta(-1)}
        disabled={disabled}
        style={{ height: '2rem', width: '2rem', fontSize: '1rem' }}
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
        style={{ height: '2rem', flex: '1', minWidth: '60px' }}
      />
      <button
        type="button"
        className="size-pack__btn"
        aria-label={ariaLabel ? `Increase ${ariaLabel}` : 'Increase quantity'}
        onClick={() => handleDelta(+1)}
        disabled={disabled}
        style={{ height: '2rem', width: '2rem', fontSize: '1rem' }}
      >
        +
      </button>
    </div>
  );
};

export default QuantityStepper;


