import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { colleges } from '../config';
import FormPage from '../app/routes/form';
import SummaryPage from '../app/routes/summary';
import ReceiptPage from '../app/routes/receipt';
import ThankYouPage from '../app/routes/thankyou';
import { useOrderFormContext } from '../contexts/OrderFormContext';

const OrderFormPage: React.FC = () => {
  const { college } = useParams();
  const location = useLocation();
  const collegeConfig = colleges[college as keyof typeof colleges];
  const categories = collegeConfig ? collegeConfig.categories : [];
  
  // Check if we're on the summary, receipt, or thankyou route
  const isSummaryPage = location.pathname.endsWith('/summary');
  const isReceiptPage = location.pathname.endsWith('/receipt');
  const isThankYouPage = location.pathname.endsWith('/thankyou');

  // Handle global sidebar toggle events
  React.useEffect(() => {
    const onGlobalToggle = () => {
      const btn = document.querySelector('[data-sidebar-toggle]') as HTMLElement | null;
      if (btn) btn.click();
    };
    window.addEventListener('global-sidebar-toggle', onGlobalToggle);
    return () => window.removeEventListener('global-sidebar-toggle', onGlobalToggle);
  }, []);

  // Get shared state from context
  const context = useOrderFormContext();
  const {
    formData,
    error,
    invalidProductPaths,
    validProductPaths,
    page,
    sending,
    handleQuantityChange,
    handleShirtVersionChange,
    handleSizeCountsChange,
    handleDisplayOptionChange,
    handleSweatpantJoggerOptionChange,
    handleFormSubmit,
    handleBack,
    handleBackToSummary,
    handleExit,
    handleConfirm
  } = context;
  const handleFormDataChange = context.handleFormDataChange;

  if (!collegeConfig) {
    return <div style={{ textAlign: 'center', marginTop: '2rem', color: '#dc2626' }}>College not found</div>;
  }

  if (isSummaryPage) {
    return <SummaryPage 
      formData={formData}
      onBack={handleBack}
      onConfirm={handleConfirm}
      sending={sending}
      categories={categories}
      college={college}
    />;
  }

  if (isReceiptPage || page === 'receipt') {
    return <ReceiptPage 
      formData={formData}
      onBackToSummary={handleBackToSummary}
      onExit={handleExit}
      categories={categories}
    />;
  }

  if (isThankYouPage || page === 'thankyou') {
    return <ThankYouPage />;
  }

  return (
    <FormPage
      formData={formData}
      onFormDataChange={handleFormDataChange}
      onQuantityChange={handleQuantityChange}
      onShirtVersionChange={handleShirtVersionChange}
      onSizeCountsChange={handleSizeCountsChange}
      onDisplayOptionChange={handleDisplayOptionChange}
      onSweatpantJoggerOptionChange={handleSweatpantJoggerOptionChange}
      onSubmit={handleFormSubmit}
      error={error}
      invalidProductPaths={invalidProductPaths}
      validProductPaths={validProductPaths}
      collegeConfig={collegeConfig}
      college={college}
      categories={categories}
    />
  );
};

export default OrderFormPage;
