import React from 'react';
import { useParams } from 'react-router-dom';
import ProductDetailPage from '../../app/routes/productDetail';
import { colleges } from '../../config';
import { useOrderFormContext } from '../../shared/contexts/OrderFormContext';
import { Category } from '../../shared/types';
import ErrorMessage from '../../shared/ui/ErrorMessage';

const ProductDetailPageWrapper: React.FC = () => {
  const { college } = useParams();

  const collegeConfig = college ? (colleges as any)[college] : undefined;
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
  } = useOrderFormContext();

  if (!collegeConfig) {
    return <ErrorMessage>College not found</ErrorMessage>;
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
    />
  );
};

export default ProductDetailPageWrapper;

