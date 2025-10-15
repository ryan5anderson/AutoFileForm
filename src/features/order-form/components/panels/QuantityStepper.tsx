import React from 'react';
import styles from './Panel.module.css';

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
    const adjusted = step > 1 ? Math.ceil(raw / step) * step : raw;
    onChange(adjusted);
  };

  return (
    <div className={styles.quantityStepper}>
      <button
        type="button"
        className={styles.stepperButton}
        aria-label={ariaLabel ? `Decrease ${ariaLabel}` : 'Decrease quantity'}
        onClick={() => handleDelta(-1)}
        disabled={disabled}
      >
        -
      </button>
      <input
        className={styles.stepperInput}
        aria-label={ariaLabel ? `${ariaLabel} quantity` : 'Quantity'}
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleInput}
        disabled={disabled}
      />
      <button
        type="button"
        className={styles.stepperButton}
        aria-label={ariaLabel ? `Increase ${ariaLabel}` : 'Increase quantity'}
        onClick={() => handleDelta(+1)}
        disabled={disabled}
      >
        +
      </button>
    </div>
  );
};

export default QuantityStepper;


