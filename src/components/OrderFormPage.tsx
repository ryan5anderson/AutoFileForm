import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { colleges } from '../constants/colleges';
import FormPage from './FormPage';
import SummaryPage from './SummaryPage';
import ReceiptPage from './ReceiptPage';
import ThankYouPage from './ThankYouPage';
import { useOrderForm } from '../hooks';

const OrderFormPage: React.FC = () => {
  const { college } = useParams();
  const location = useLocation();
  const collegeConfig = colleges[college as keyof typeof colleges];
  const categories = collegeConfig ? collegeConfig.categories : [];
  
  // Check if we're on the summary, receipt, or thankyou route
  const isSummaryPage = location.pathname.endsWith('/summary');
  const isReceiptPage = location.pathname.endsWith('/receipt');
  const isThankYouPage = location.pathname.endsWith('/thankyou');

  // Dynamically set --color-primary for Arizona State
  React.useEffect(() => {
    if (college === 'arizonastate') {
      document.documentElement.style.setProperty('--color-primary', '#8c2434'); // Maroon
    } else if (college === 'michiganstate') {
      document.documentElement.style.setProperty('--color-primary', '#166534'); // MSU green
    } else {
      document.documentElement.style.setProperty('--color-primary', '#111111'); // Default black
    }
  }, [college]);

  const {
    formData,
    error,
    page,
    sending,
    handleFormDataChange,
    handleQuantityChange,
    handleShirtVersionChange,
    handleColorVersionChange,
    handleShirtColorComboChange,
    handleDisplayOptionChange,
    handleSweatpantJoggerOptionChange,
    handleFormSubmit,
    handleBack,
    handleBackToSummary,
    handleExit,
    handleConfirm
  } = useOrderForm(categories);

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
      onColorVersionChange={handleColorVersionChange}
      onDisplayOptionChange={handleDisplayOptionChange}
      onSweatpantJoggerOptionChange={handleSweatpantJoggerOptionChange}
      onShirtColorComboChange={handleShirtColorComboChange}
      onSubmit={handleFormSubmit}
      error={error}
      collegeConfig={collegeConfig}
      college={college}
    />
  );
};

export default OrderFormPage;
