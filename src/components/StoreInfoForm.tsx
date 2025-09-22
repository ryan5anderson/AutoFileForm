import React from 'react';
import { FormData } from '../types';

interface StoreInfoFormProps {
  formData: FormData;
  onFormDataChange: (updates: Partial<FormData>) => void;
}

const StoreInfoForm: React.FC<StoreInfoFormProps> = ({ formData, onFormDataChange }) => {
  return (
    <div className="form-section">
      <div>
        <label htmlFor="company" style={{ 
          display: 'block', 
          marginBottom: 'var(--space-2)', 
          fontWeight: '600',
          color: 'var(--color-text)'
        }}>
          Company
        </label>
        <input
          type="text"
          id="company"
          value={formData.company}
          onChange={(e) => onFormDataChange({ company: e.target.value })}
          style={{
            width: '100%',
            padding: 'var(--space-3)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            fontSize: '1rem',
            background: 'var(--color-input-bg)'
          }}
          required
        />
      </div>
      <div>
        <label htmlFor="storeNumber" style={{ 
          display: 'block', 
          marginBottom: 'var(--space-2)', 
          fontWeight: '600',
          color: 'var(--color-text)'
        }}>
          Store Number
        </label>
        <input
          type="text"
          id="storeNumber"
          value={formData.storeNumber}
          onChange={(e) => onFormDataChange({ storeNumber: e.target.value })}
          style={{
            width: '100%',
            padding: 'var(--space-3)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            fontSize: '1rem',
            background: 'var(--color-input-bg)'
          }}
          required
        />
      </div>
      <div>
        <label htmlFor="storeManager" style={{ 
          display: 'block', 
          marginBottom: 'var(--space-2)', 
          fontWeight: '600',
          color: 'var(--color-text)'
        }}>
          Store Manager
        </label>
        <input
          type="text"
          id="storeManager"
          value={formData.storeManager}
          onChange={(e) => onFormDataChange({ storeManager: e.target.value })}
          style={{
            width: '100%',
            padding: 'var(--space-3)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            fontSize: '1rem',
            background: 'var(--color-input-bg)'
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
            background: 'var(--color-input-bg)'
          }}
          required
        />
      </div>
    </div>
  );
};

export default StoreInfoForm; 