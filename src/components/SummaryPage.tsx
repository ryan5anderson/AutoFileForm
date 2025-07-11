import React from 'react';
import { FormData, Category } from '../types';
import { categories } from '../constants';
import CategorySection from './CategorySection';

interface SummaryPageProps {
  formData: FormData;
  onBack: () => void;
  onConfirm: () => void;
  sending: boolean;
}

const SummaryPage: React.FC<SummaryPageProps> = ({
  formData,
  onBack,
  onConfirm,
  sending
}) => {
  return (
    <div style={{ 
      background: 'var(--color-bg)', 
      minHeight: '100vh', 
      padding: 'var(--space-4)',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{ 
        color: 'var(--color-primary)', 
        marginBottom: 'var(--space-6)', 
        fontSize: '2rem',
        fontWeight: '600',
        textAlign: 'center'
      }}>
        Order Summary
      </h1>
      
      <div style={{ 
        background: 'var(--color-bg)', 
        borderRadius: 'var(--radius-lg)', 
        padding: 'var(--space-4)', 
        marginBottom: 'var(--space-6)',
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
          Store Information
        </h2>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-3)'
        }}>
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <strong style={{ color: 'var(--color-text)' }}>Store Number:</strong> 
            <span style={{ marginLeft: 'var(--space-2)' }}>{formData.storeNumber}</span>
          </div>
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <strong style={{ color: 'var(--color-text)' }}>Store Manager:</strong> 
            <span style={{ marginLeft: 'var(--space-2)' }}>{formData.storeManager}</span>
          </div>
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <strong style={{ color: 'var(--color-text)' }}>Date:</strong> 
            <span style={{ marginLeft: 'var(--space-2)' }}>{formData.date}</span>
          </div>
        </div>
      </div>
      
      {categories.map((category: Category) => (
        <CategorySection
          key={category.name}
          category={category}
          quantities={formData.quantities}
          shirtVersions={formData.shirtVersions}
          readOnly={true}
        />
      ))}
      
      <div style={{ 
        display: 'flex', 
        gap: 'var(--space-3)', 
        marginTop: 'var(--space-6)',
        maxWidth: '400px',
        margin: 'var(--space-6) auto 0'
      }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'var(--color-bg)',
            color: 'var(--color-primary)',
            padding: 'var(--space-3) var(--space-4)',
            border: '2px solid var(--color-primary)',
            borderRadius: 'var(--radius-lg)',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            flex: 1,
            transition: 'all 0.2s ease'
          }}
        >
          Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          style={{
            background: 'var(--color-primary)',
            color: 'white',
            padding: 'var(--space-3) var(--space-4)',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            flex: 1
          }}
          disabled={sending}
        >
          {sending ? 'Sending...' : 'Confirm Order'}
        </button>
      </div>
    </div>
  );
};

export default SummaryPage; 