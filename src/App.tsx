import React from 'react';
import './styles/global.css';
import './styles/tokens.css';
import { useOrderForm } from './hooks';
import { FormPage, SummaryPage, ReceiptPage, ThankYouPage } from './components';

function App() {
  const {
    formData,
    error,
    page,
    sending,
    handleFormDataChange,
    handleQuantityChange,
    handleShirtVersionChange,
    handleSelectAll,
    handleFormSubmit,
    handleBack,
    handleBackToSummary,
    handleExit,
    handleConfirm
  } = useOrderForm();

  if (page === 'summary') {
    return (
      <SummaryPage
        formData={formData}
        onBack={handleBack}
        onConfirm={handleConfirm}
        sending={sending}
      />
    );
  }

  if (page === 'receipt') {
    return <ReceiptPage formData={formData} onBackToSummary={handleBackToSummary} onExit={handleExit} />;
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
      onSelectAll={handleSelectAll}
      onSubmit={handleFormSubmit}
      error={error}
    />
  );
}

export default App;
