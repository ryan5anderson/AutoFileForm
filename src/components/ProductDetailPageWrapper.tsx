import React from 'react';
import { useParams } from 'react-router-dom';

import ProductDetailPage from '../app/routes/productDetail';
import { colleges } from '../config';
import { useOrderFormContext } from '../contexts/OrderFormContext';
import { Category } from '../types';

const ProductDetailPageWrapper: React.FC = () => {
  const { college } = useParams();

  const collegeConfig = college ? colleges[college as keyof typeof colleges] : undefined;
  const categories: Category[] = collegeConfig?.categories ?? [];

  // Get shared state from context
  const {
    formData,
    handleQuantityChange,
    handleShirtVersionChange,
    handleSizeCountsChange,
    handleDisplayOptionChange,
    handleSweatpantJoggerOptionChange,
    handlePantOptionChange,
    handleColorOptionChange,
    handleShirtColorSizeCountsChange,
    handleInfantSizeCountsChange,
  } = useOrderFormContext();

  if (!collegeConfig) {
    return <div style={{ textAlign: 'center', marginTop: '2rem', color: '#dc2626' }}>College not found</div>;
  }

  return (
    <ProductDetailPage
      categories={categories}
      formData={formData}
      onQuantityChange={handleQuantityChange}
      onShirtVersionChange={handleShirtVersionChange}
      onSizeCountsChange={handleSizeCountsChange}
      onDisplayOptionChange={handleDisplayOptionChange}
      onSweatpantJoggerOptionChange={handleSweatpantJoggerOptionChange}
      onPantOptionChange={handlePantOptionChange}
      onColorOptionChange={handleColorOptionChange}
      onShirtColorSizeCountsChange={handleShirtColorSizeCountsChange}
      onInfantSizeCountsChange={handleInfantSizeCountsChange}
    />
  );
};

export default ProductDetailPageWrapper;

