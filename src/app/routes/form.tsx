import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FormData, Category, ShirtVersion, DisplayOption, SweatpantJoggerOption, SizeCounts } from '../../shared/types';
import StoreInfoForm from '../../features/order-form/components/StoreInfoForm';
import CategorySection from '../../features/order-form/components/CategorySection';
import OrderNotesSection from '../../features/order-form/components/OrderNotesSection';
import Footer from '../layout/Footer';
import '../../shared/styles/college-pages.css';

interface CollegeConfig {
  name: string;
  logo: string;
  categories: Category[];
}

interface FormPageProps {
  formData: FormData;
  onFormDataChange: (updates: Partial<FormData>) => void;
  onQuantityChange: (imagePath: string, value: string) => void;
  onShirtVersionChange: (imagePath: string, version: keyof ShirtVersion, value: string) => void;
  onSizeCountsChange?: (imagePath: string, version: keyof ShirtVersion, counts: SizeCounts) => void;
  onDisplayOptionChange: (imagePath: string, option: keyof DisplayOption, value: string) => void;
  onSweatpantJoggerOptionChange: (imagePath: string, option: keyof SweatpantJoggerOption, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
  invalidProductPaths: string[];
  validProductPaths: string[];
  collegeConfig?: CollegeConfig;
  college?: string;
  categories?: Category[];
}

const FormPage: React.FC<FormPageProps> = ({
  formData,
  onFormDataChange,
  onQuantityChange,
  onShirtVersionChange,
  onSizeCountsChange,
  onDisplayOptionChange,
  onSweatpantJoggerOptionChange,
  onSubmit,
  error,
  invalidProductPaths,
  validProductPaths,
  collegeConfig,
  college,
  categories
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const sortedCategories = useMemo(() => {
    const list = categories || (collegeConfig ? [...collegeConfig.categories] : []);
    // Move display options to the bottom if present
    return list.sort((a, b) => {
      const aIsDisplay = a.hasDisplayOptions || a.name.toLowerCase().includes('display options');
      const bIsDisplay = b.hasDisplayOptions || b.name.toLowerCase().includes('display options');
      if (aIsDisplay && !bIsDisplay) return 1;
      if (!aIsDisplay && bIsDisplay) return -1;
      return 0;
    });
  }, [categories, collegeConfig]);
  const collegeName = collegeConfig ? collegeConfig.name : 'College';

  // Scroll to category when returning from product detail page
  useEffect(() => {
    const state = location.state as any;
    if (state?.returnFromProduct && state?.scrollToCategory) {
      const categoryId = state.scrollToCategory.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
      setTimeout(() => {
        const element = document.getElementById(categoryId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      // Clear the state after scrolling
      window.history.replaceState({}, document.title);
    }
  }, [location]);


  return (
    <div className="college-page-container">
      <main className="college-page-main">
        <div className="college-page-title">
          <h1>{collegeName} Product Order Form</h1>
          <p>Select your merchandise and quantities below</p>
        </div>
        
        <form onSubmit={(e) => {
          // Intercept to scroll to first invalid size pack if present
          const helpers = Array.from(document.querySelectorAll('.size-pack__helper')) as HTMLElement[];
          const firstInvalid = helpers.find(el => el.getAttribute('data-positive') === 'true' && el.getAttribute('data-valid') === 'false');
          if (firstInvalid) {
            e.preventDefault();
            // If the card is collapsed, click its header toggle
            const cardBody = firstInvalid.closest('.card__body') as HTMLElement | null;
            const card = cardBody ? (cardBody.parentElement as HTMLElement | null) : null;
            if (card) {
              const header = card.querySelector('.card__header') as HTMLElement | null;
              if (header && !cardBody?.classList.contains('card__body--expanded')) {
                header.click();
              }
              card.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          } else {
            onSubmit(e);
          }
        }}>
          <StoreInfoForm formData={formData} onFormDataChange={onFormDataChange} />
          
          {sortedCategories.map((category: Category) => (
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
              invalidProductPaths={invalidProductPaths}
              validProductPaths={validProductPaths}
              onQuantityChange={onQuantityChange}
              onShirtVersionChange={onShirtVersionChange}
              onSizeCountsChange={onSizeCountsChange}
              onDisplayOptionChange={onDisplayOptionChange}
              onSweatpantJoggerOptionChange={onSweatpantJoggerOptionChange}
              college={college}
            />
          ))}

          <OrderNotesSection formData={formData} onFormDataChange={onFormDataChange} />

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="submit-section">
            <button
              type="submit"
              className="submit-button"
            >
              Review Order
            </button>
          </div>
        </form>
      </main>
      
      <Footer />
    </div>
  );
};

export default FormPage; 