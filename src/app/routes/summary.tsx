import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { colleges } from '../../config';
import CategorySection from '../../features/components/CategorySection';
import { useOrderForm } from '../../features/hooks';
import { FormData, Category } from '../../types';
import Footer from '../layout/Footer';
import Header from '../layout/Header';
import '../../styles/college-pages.css';

interface SummaryPageProps {
  formData?: FormData;
  onBack?: () => void;
  onConfirm?: () => void;
  sending?: boolean;
  categories?: Category[];
  college?: string;
  showConfirmModal?: boolean;
  confirmationError?: string | null;
  onConfirmSubmit?: () => void;
  onConfirmCancel?: () => void;
}

const SummaryPage: React.FC<SummaryPageProps> = ({
  formData: propFormData,
  onBack: propOnBack,
  onConfirm: propOnConfirm,
  sending: propSending,
  categories: propCategories,
  college: propCollege,
  showConfirmModal: propShowConfirmModal,
  confirmationError: propConfirmationError,
  onConfirmSubmit: propOnConfirmSubmit,
  onConfirmCancel: propOnConfirmCancel
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
  const showConfirmModal = propShowConfirmModal !== undefined ? propShowConfirmModal : hookData.showConfirmModal;
  const confirmationError = propConfirmationError !== undefined ? propConfirmationError : hookData.confirmationError;
  const onConfirmSubmit = propOnConfirmSubmit || hookData.handleConfirmSubmit;
  const onConfirmCancel = propOnConfirmCancel || hookData.handleConfirmCancel;
  
  // Touch feedback state
  const [isTouched, setIsTouched] = useState(false);

  // Dynamically set --color-primary for college branding
  React.useEffect(() => {
    if (college === 'arizonastate') {
      document.documentElement.style.setProperty('--color-primary', '#8c2434'); // Maroon
    } else if (college === 'michiganstate') {
      document.documentElement.style.setProperty('--color-primary', '#166534'); // MSU green
    } else if (college === 'oregonuniversity') {
      document.documentElement.style.setProperty('--color-primary', '#007030'); // Official UO Green
    } else if (college === 'westvirginiauniversity') {
      document.documentElement.style.setProperty('--color-primary', '#002855'); // WVU blue
    } else if (college === 'pittsburghuniversity') {
      document.documentElement.style.setProperty('--color-primary', '#003594'); // Pitt blue
    } else if (college === 'alabamauniversity') {
      document.documentElement.style.setProperty('--color-primary', '#9E1B32'); // Alabama Crimson
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
              <strong style={{ color: 'var(--color-text)' }}>Store Name:</strong> 
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
            infantSizeCounts={formData.infantSizeCounts}
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
            onTouchStart={() => !sending && setIsTouched(true)}
            onTouchEnd={() => setIsTouched(false)}
            onMouseDown={() => !sending && setIsTouched(true)}
            onMouseUp={() => setIsTouched(false)}
            onMouseLeave={() => setIsTouched(false)}
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
              minHeight: '44px', // iOS recommended tap target size
              opacity: sending ? 0.6 : (isTouched ? 0.85 : 1),
              transform: isTouched ? 'scale(0.98)' : 'scale(1)',
              transition: 'all 0.15s ease',
              WebkitTapHighlightColor: 'rgba(0, 0, 0, 0.1)',
              touchAction: 'manipulation',
              userSelect: 'none'
            }}
            aria-label="Send Order"
          >
            {sending ? 'Sending...' : 'Send Order'}
          </button>
        </div>
        
        {/* Error message display */}
        {confirmationError && !showConfirmModal && (
          <div style={{
            background: 'rgb(239 68 68 / 10%)',
            border: '1px solid rgb(239 68 68 / 30%)',
            borderRadius: 'var(--radius-lg)',
            color: '#dc2626',
            marginTop: 'var(--space-4)',
            padding: 'var(--space-3) var(--space-4)',
            textAlign: 'center',
            fontSize: '0.9375rem'
          }}>
            {confirmationError}
          </div>
        )}
      </main>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onConfirm={onConfirmSubmit}
        onCancel={onConfirmCancel}
        title="Confirm Order Submission"
        message="Are you sure you want to submit this order? This action cannot be undone."
        confirmText="Yes, Send Order"
        cancelText="Cancel"
        isProcessing={sending}
        error={confirmationError}
      />
      
      <Footer />
    </div>
  );
};

export default SummaryPage; 