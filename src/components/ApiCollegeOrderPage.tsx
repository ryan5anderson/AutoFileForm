import React from 'react';
import { useLocation } from 'react-router-dom';

import ApiCollegeOrderForm from '../app/routes/ApiCollegeOrderForm';
import ApiCollegeReceiptPage from '../app/routes/ApiCollegeReceiptPage';
import ApiCollegeSummaryPage from '../app/routes/ApiCollegeSummaryPage';
import ThankYouPage from '../app/routes/thankyou';
import { useApiCollegeOrder } from '../contexts/ApiCollegeOrderContext';

import ApiCollegeLoadingScreen from './ApiCollegeLoadingScreen';

const ApiCollegeOrderPage: React.FC = () => {
  const location = useLocation();
  const { categories, loading, error } = useApiCollegeOrder();

  const isSummaryPage = location.pathname.endsWith('/summary');
  const isReceiptPage = location.pathname.endsWith('/receipt');
  const isThankYouPage = location.pathname.endsWith('/thankyou');

  if (loading && categories.length === 0) {
    return (
      <div className="content-below-app-header api-loading-page">
        <ApiCollegeLoadingScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-below-app-header api-school-status" role="alert">
        <div className="error-message">{error}</div>
        <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text)', fontSize: '0.95rem' }}>
          If this keeps happening, confirm <code style={{ fontSize: '0.85em' }}>vercel dev</code> (or your API) is
          running locally, or try another school from the home page.
        </p>
      </div>
    );
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
