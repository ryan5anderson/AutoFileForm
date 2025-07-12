import React from 'react';
import { FormData } from '../types';

interface OrderNotesSectionProps {
  formData: FormData;
  onFormDataChange: (updates: Partial<FormData>) => void;
}

const OrderNotesSection: React.FC<OrderNotesSectionProps> = ({ formData, onFormDataChange }) => {
  return (
    <div style={{
      marginBottom: 'var(--space-6)',
      background: 'var(--color-bg)',
      padding: 'var(--space-4)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)'
    }}>
      <h2 style={{ 
        color: 'var(--color-primary)',
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: 'var(--space-3)',
        borderBottom: '2px solid var(--color-primary)',
        paddingBottom: 'var(--space-2)'
      }}>
        Order Notes
      </h2>
      
      <div>
        <label htmlFor="orderNotes" style={{ 
          display: 'block', 
          marginBottom: 'var(--space-2)', 
          fontWeight: '600',
          color: 'var(--color-text)'
        }}>
          Additional Comments
        </label>
        <textarea
          id="orderNotes"
          value={formData.orderNotes}
          onChange={(e) => onFormDataChange({ orderNotes: e.target.value })}
          placeholder="Enter any additional comments, special requests, or notes for this order..."
          style={{
            width: '100%',
            minHeight: '120px',
            padding: 'var(--space-3)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            fontSize: '1rem',
            background: 'var(--color-input-bg)',
            fontFamily: 'inherit',
            resize: 'vertical',
            lineHeight: '1.5'
          }}
        />
      </div>
    </div>
  );
};

export default OrderNotesSection; 