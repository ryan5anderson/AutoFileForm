import React from 'react';
import { FormData, Category } from '../types';
import CategorySection from './CategorySection';
import Header from './Header';
import Footer from './Footer';

interface SummaryPageProps {
  formData: FormData;
  onBack: () => void;
  onConfirm: () => void;
  sending: boolean;
  categories: Category[];
}

const SummaryPage: React.FC<SummaryPageProps> = ({
  formData,
  onBack,
  onConfirm,
  sending,
  categories
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
              <strong style={{ color: 'var(--color-text)' }}>Company:</strong> 
              <span style={{ marginLeft: 'var(--space-2)' }}>{formData.company}</span>
            </div>
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
            colorVersions={formData.colorVersions}
            shirtColorComboVersions={formData.shirtColorComboVersions}
            displayOptions={formData.displayOptions}
            sweatpantJoggerOptions={formData.sweatpantJoggerOptions}
            readOnly={true}
          />
        ))}

        {formData.orderNotes && (
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
              Order Notes
            </h2>
            <div style={{ 
              fontSize: '1rem',
              lineHeight: '1.6',
              color: 'var(--color-text)',
              whiteSpace: 'pre-wrap'
            }}>
              {formData.orderNotes}
            </div>
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
            onClick={onBack}
            disabled={sending}
            style={{
              background: 'var(--color-bg)',
              color: 'var(--color-primary)',
              padding: 'var(--space-3) var(--space-4)',
              border: '2px solid var(--color-primary)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: sending ? 'not-allowed' : 'pointer',
              minWidth: '150px',
              opacity: sending ? 0.6 : 1
            }}
          >
            Back to Form
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={sending}
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              padding: 'var(--space-3) var(--space-4)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: sending ? 'not-allowed' : 'pointer',
              minWidth: '150px',
              opacity: sending ? 0.6 : 1
            }}
          >
            {sending ? 'Sending...' : 'Send Order'}
          </button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SummaryPage; 