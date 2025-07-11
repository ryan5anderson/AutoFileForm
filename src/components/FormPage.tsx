import React from 'react';
import { FormData, Category, ShirtVersion } from '../types';
import { categories } from '../constants';
import StoreInfoForm from './StoreInfoForm';
import CategorySection from './CategorySection';

interface FormPageProps {
  formData: FormData;
  onFormDataChange: (updates: Partial<FormData>) => void;
  onQuantityChange: (imagePath: string, value: string) => void;
  onShirtVersionChange: (imagePath: string, version: keyof ShirtVersion, value: string) => void;
  onSelectAll: () => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
}

const FormPage: React.FC<FormPageProps> = ({
  formData,
  onFormDataChange,
  onQuantityChange,
  onShirtVersionChange,
  onSelectAll,
  onSubmit,
  error
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
        Michigan State Product Order Form
      </h1>
      
      <form onSubmit={onSubmit}>
        <StoreInfoForm formData={formData} onFormDataChange={onFormDataChange} />
        
        {categories.map((category: Category) => (
          <CategorySection
            key={category.name}
            category={category}
            quantities={formData.quantities}
            shirtVersions={formData.shirtVersions}
            onQuantityChange={onQuantityChange}
            onShirtVersionChange={onShirtVersionChange}
          />
        ))}

        {error && (
          <div style={{ 
            color: '#dc2626', 
            marginBottom: 'var(--space-3)', 
            fontWeight: '500',
            padding: 'var(--space-3)',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius)',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <div style={{
          display: 'flex',
          gap: 'var(--space-3)',
          justifyContent: 'center',
          marginTop: 'var(--space-6)',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={onSelectAll}
            style={{
              background: 'var(--color-bg)',
              color: 'var(--color-primary)',
              padding: 'var(--space-3) var(--space-4)',
              border: '2px solid var(--color-primary)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            Default Quantity (10)
          </button>
          
          <button
            type="submit"
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              padding: 'var(--space-3) var(--space-4)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            Review Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormPage; 