import React from 'react';

import { FormData } from '../../types';
import { sanitizeFiveDigitInput, sanitizeSingleLineInput } from '../utils/sanitize';

interface StoreInfoFormProps {
  formData: FormData;
  onFormDataChange: (updates: Partial<FormData>) => void;
  /** When set, sales-prefilled fields are hidden for API store-manager links. */
  variant?: 'full' | 'prefilledStore';
  /** API schools: "Account Name" label and 5-digit constraints on account name & store number. */
  apiSchool?: boolean;
}

const StoreInfoForm: React.FC<StoreInfoFormProps> = ({
  formData,
  onFormDataChange,
  variant = 'full',
  apiSchool = false,
}) => {
  const isPrefilledStore = variant === 'prefilledStore';
  const nameLabel = apiSchool ? 'Account Name' : 'Store Name';
  const fiveDigitTitle = 'Must be exactly 5 digits (e.g. 12345)';

  return (
    <div className="form-section">
      {!isPrefilledStore && (
        <>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label
              htmlFor="company"
              style={{
                display: 'block',
                marginBottom: 'var(--space-2)',
                fontWeight: '600',
                color: 'var(--color-text)',
              }}
            >
              {nameLabel}
            </label>
            <input
              type="text"
              id="company"
              value={formData.company}
              onChange={(e) =>
                onFormDataChange({
                  company: apiSchool
                    ? sanitizeFiveDigitInput(e.target.value)
                    : sanitizeSingleLineInput(e.target.value),
                })
              }
              inputMode={apiSchool ? 'numeric' : undefined}
              pattern={apiSchool ? '\\d{5}' : undefined}
              maxLength={apiSchool ? 5 : undefined}
              title={apiSchool ? fiveDigitTitle : undefined}
              placeholder={apiSchool ? '12345' : undefined}
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                fontSize: '1rem',
                background: 'var(--color-input-bg)',
                color: '#000000',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label
              htmlFor="storeNumber"
              style={{
                display: 'block',
                marginBottom: 'var(--space-2)',
                fontWeight: '600',
                color: 'var(--color-text)',
              }}
            >
              Store Number
            </label>
            <input
              type="text"
              id="storeNumber"
              value={formData.storeNumber}
              onChange={(e) =>
                onFormDataChange({
                  storeNumber: apiSchool
                    ? sanitizeFiveDigitInput(e.target.value)
                    : sanitizeSingleLineInput(e.target.value),
                })
              }
              inputMode={apiSchool ? 'numeric' : undefined}
              pattern={apiSchool ? '\\d{5}' : undefined}
              maxLength={apiSchool ? 5 : undefined}
              title={apiSchool ? fiveDigitTitle : undefined}
              placeholder={apiSchool ? '12345' : undefined}
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                fontSize: '1rem',
                background: 'var(--color-input-bg)',
                color: '#000000',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label htmlFor="poNumber" style={{
              display: 'block',
              marginBottom: 'var(--space-2)',
              fontWeight: '600',
              color: 'var(--color-text)'
            }}>
              PO Number
            </label>
            <input
              type="text"
              id="poNumber"
              value={formData.poNumber || ''}
              onChange={(e) => onFormDataChange({ poNumber: sanitizeSingleLineInput(e.target.value) })}
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                fontSize: '1rem',
                background: 'var(--color-input-bg)',
                color: '#000000',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
        </>
      )}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <label htmlFor="orderedBy" style={{ 
          display: 'block', 
          marginBottom: 'var(--space-2)', 
          fontWeight: '600',
          color: 'var(--color-text)'
        }}>
          Ordered By
        </label>
        <input
          type="text"
          id="orderedBy"
          value={formData.orderedBy}
          onChange={(e) => onFormDataChange({ orderedBy: sanitizeSingleLineInput(e.target.value) })}
          style={{
            width: '100%',
            padding: 'var(--space-3)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            fontSize: '1rem',
            background: 'var(--color-input-bg)',
            color: '#000000',
            boxSizing: 'border-box'
          }}
          required
        />
      </div>
      <div>
        <label htmlFor="date" style={{ 
          display: 'block', 
          marginBottom: 'var(--space-2)', 
          fontWeight: '600',
          color: 'var(--color-text)'
        }}>
          Date
        </label>
        <input
          type="date"
          id="date"
          value={formData.date}
          onChange={(e) => onFormDataChange({ date: e.target.value })}
          style={{
            width: '100%',
            padding: 'var(--space-3)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            fontSize: '1rem',
            background: 'var(--color-input-bg)',
            color: '#000000',
            boxSizing: 'border-box'
          }}
          required
        />
      </div>
    </div>
  );
};

export default StoreInfoForm;
