import React from 'react';
import { useLocation } from 'react-router-dom';

import ApiCollegeOrderForm from '../app/routes/ApiCollegeOrderForm';
import ApiCollegeReceiptPage from '../app/routes/ApiCollegeReceiptPage';
import ApiCollegeSummaryPage from '../app/routes/ApiCollegeSummaryPage';
import ThankYouPage from '../app/routes/thankyou';
import { useApiCollegeOrder } from '../contexts/ApiCollegeOrderContext';

const ApiCollegeOrderPage: React.FC = () => {
  const location = useLocation();
  const { categories, loading, error } = useApiCollegeOrder();

  const isSummaryPage = location.pathname.endsWith('/summary');
  const isReceiptPage = location.pathname.endsWith('/receipt');
  const isThankYouPage = location.pathname.endsWith('/thankyou');

  if (loading && categories.length === 0) {
    return <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>Loading order data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (isSummaryPage) {
    return <ApiCollegeSummaryPage />;
  }

  if (isReceiptPage) {
    return <ApiCollegeReceiptPage />;
  }

  if (isThankYouPage) {
    return (
      <div className="api-schools-flow">
        <ThankYouPage />
      </div>
    );
  }

  return <ApiCollegeOrderForm />;
};

export default ApiCollegeOrderPage;
