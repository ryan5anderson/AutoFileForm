import React from 'react';
import { useParams } from 'react-router-dom';
import { colleges } from '../constants/colleges';
import FormPage from './FormPage';
import SummaryPage from './SummaryPage';
import ReceiptPage from './ReceiptPage';
import ThankYouPage from './ThankYouPage';
import { useOrderForm } from '../hooks';

const OrderFormPage: React.FC = () => {
  const { college } = useParams();
  const collegeConfig = colleges[college as keyof typeof colleges];
  const categories = collegeConfig ? collegeConfig.categories : [];

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

  if (page === 'summary') {
    return (
      <SummaryPage
        formData={formData}
        onBack={handleBack}
        onConfirm={handleConfirm}
        sending={sending}
        categories={categories}
      />
    );
  }

  if (page === 'receipt') {
    return <ReceiptPage formData={formData} onBackToSummary={handleBackToSummary} onExit={handleExit} categories={categories} />;
  }

  if (page === 'thankyou') {
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
    />
  );
};

export default OrderFormPage; 