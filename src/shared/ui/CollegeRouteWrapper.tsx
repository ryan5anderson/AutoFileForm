import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { colleges } from '../../config';
import { OrderFormProvider } from '../contexts/OrderFormContext';
import OrderFormPage from '../../features/order-form/pages/OrderFormPage';
import ProductDetailPageWrapper from '../../pages/product-detail/ProductDetailPageWrapper';
import ErrorMessage from './ErrorMessage';

const CollegeRouteWrapper: React.FC = () => {
  const { college } = useParams();
  const collegeConfig = college ? (colleges as any)[college] : undefined;
  const categories = collegeConfig?.categories ?? [];

  // Apply college-specific theme
  React.useEffect(() => {
    if (college === 'arizonastate') {
      document.documentElement.style.setProperty('--color-primary', '#8c2434'); // Maroon
    } else if (college === 'michiganstate') {
      document.documentElement.style.setProperty('--color-primary', '#166534'); // MSU green
    } else if (college === 'westvirginiauniversity') {
      document.documentElement.style.setProperty('--color-primary', '#002855'); // WVU blue
    } else if (college === 'pittsburghuniversity') {
      document.documentElement.style.setProperty('--color-primary', '#003594'); // Pitt blue
    } else {
      document.documentElement.style.setProperty('--color-primary', '#111111'); // Default black
    }
  }, [college]);

  if (!collegeConfig) {
    return <ErrorMessage>College not found</ErrorMessage>;
  }

  return (
    <OrderFormProvider categories={categories}>
      <Routes>
        <Route path="product/:category/:productId" element={<ProductDetailPageWrapper />} />
        <Route path="summary" element={<OrderFormPage />} />
        <Route path="receipt" element={<OrderFormPage />} />
        <Route path="thankyou" element={<OrderFormPage />} />
        <Route path="" element={<OrderFormPage />} />
      </Routes>
    </OrderFormProvider>
  );
};

export default CollegeRouteWrapper;

