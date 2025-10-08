import React from 'react';
import { useParams } from 'react-router-dom';
import { FormData, Category } from '../../types';
import { colleges } from '../../config';
import CategorySection from '../../features/components/CategorySection';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { useOrderForm } from '../../features/hooks';
import '../../styles/college-pages.css';

interface SummaryPageProps {
  formData?: FormData;
  onBack?: () => void;
  onConfirm?: () => void;
  sending?: boolean;
  categories?: Category[];
  college?: string;
}

const SummaryPage: React.FC<SummaryPageProps> = ({
  formData: propFormData,
  onBack: propOnBack,
  onConfirm: propOnConfirm,
  sending: propSending,
  categories: propCategories,
  college: propCollege
}) => {
  // URL parameter handling
  const { college: urlCollege } = useParams();
  const collegeConfig = colleges[urlCollege as keyof typeof colleges];
  const categories = propCategories || (collegeConfig ? collegeConfig.categories : []);
  
  // Use hook if no props provided (standalone mode)
  const hookData = useOrderForm(categories);
  const formData = propFormData || hookData.formData;
  const onBack = propOnBack || hookData.handleBack;
  const onConfirm = propOnConfirm || hookData.handleConfirm;
  const sending = propSending || hookData.sending;
  const college = propCollege || urlCollege;

  // Dynamically set --color-primary for college branding
  React.useEffect(() => {
    if (college === 'arizonastate') {
      document.documentElement.style.setProperty('--color-primary', '#8c2434'); // Maroon
    } else if (college === 'michiganstate') {
      document.documentElement.style.setProperty('--color-primary', '#166534'); // MSU green
    } else if (college === 'westvirginiauniversity') {
      document.documentElement.style.setProperty('--color-primary', '#002855'); // WVU blue
    } else {
      document.documentElement.style.setProperty('--color-primary', '#111111'); // Default black
    }
  }, [college]);

  if (!collegeConfig && !propCategories) {
    return <div style={{ textAlign: 'center', marginTop: '2rem', color: '#dc2626' }}>College not found</div>;
  }
  return (
    <div className="summary-page-container">
      <div className="college-page-header">
        <Header showBackButton={true} />
      </div>
      
      <main className="summary-page-main">
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
        
        {[...categories].sort((a: Category, b: Category) => {
          const aIsDisplay = a.hasDisplayOptions || a.name.toLowerCase().includes('display options');
          const bIsDisplay = b.hasDisplayOptions || b.name.toLowerCase().includes('display options');
          if (aIsDisplay && !bIsDisplay) return 1;
          if (!aIsDisplay && bIsDisplay) return -1;
          return 0;
        }).map((category: Category) => (
          <CategorySection
            key={category.name}
            category={category}
            quantities={formData.quantities}
            shirtVersions={formData.shirtVersions}
            shirtSizeCounts={formData.shirtSizeCounts}
            displayOptions={formData.displayOptions}
            sweatpantJoggerOptions={formData.sweatpantJoggerOptions}
            pantOptions={formData.pantOptions}
            colorOptions={formData.colorOptions}
            shirtColorSizeCounts={formData.shirtColorSizeCounts}
            readOnly={true}
            college={college}
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