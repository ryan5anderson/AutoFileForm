import React from 'react';
import { FormData, Category, ShirtVersion, ColorVersion, DisplayOption, SweatpantJoggerOption } from '../types';
import { categories } from '../constants';
import StoreInfoForm from './StoreInfoForm';
import CategorySection from './CategorySection';
import OrderNotesSection from './OrderNotesSection';
import Header from './Header';
import Footer from './Footer';

interface FormPageProps {
  formData: FormData;
  onFormDataChange: (updates: Partial<FormData>) => void;
  onQuantityChange: (imagePath: string, value: string) => void;
  onShirtVersionChange: (imagePath: string, version: keyof ShirtVersion, value: string) => void;
  onColorVersionChange: (imagePath: string, color: keyof ColorVersion, value: string) => void;
  onDisplayOptionChange: (imagePath: string, option: keyof DisplayOption, value: string) => void;
  onSweatpantJoggerOptionChange: (imagePath: string, option: keyof SweatpantJoggerOption, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
  onShirtColorComboChange: (imagePath: string, version: string, color: string, value: string) => void;
}

const FormPage: React.FC<FormPageProps> = ({
  formData,
  onFormDataChange,
  onQuantityChange,
  onShirtVersionChange,
  onColorVersionChange,
  onDisplayOptionChange,
  onSweatpantJoggerOptionChange,
  onSubmit,
  error,
  onShirtColorComboChange
}) => {
  return (
    <div style={{ 
      background: 'var(--color-bg)', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header />
      
      <main style={{
        flex: 1,
        padding: 'var(--space-4)',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
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
              colorVersions={formData.colorVersions}
              shirtColorComboVersions={formData.shirtColorComboVersions}
              displayOptions={formData.displayOptions}
              sweatpantJoggerOptions={formData.sweatpantJoggerOptions}
              onQuantityChange={onQuantityChange}
              onShirtVersionChange={onShirtVersionChange}
              onColorVersionChange={onColorVersionChange}
              onShirtColorComboChange={onShirtColorComboChange}
              onDisplayOptionChange={onDisplayOptionChange}
              onSweatpantJoggerOptionChange={onSweatpantJoggerOptionChange}
            />
          ))}

          <OrderNotesSection formData={formData} onFormDataChange={onFormDataChange} />

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
      </main>
      
      <Footer />
    </div>
  );
};

export default FormPage; 