import React from 'react';
import { FormData, Category, ShirtVersion, ColorVersion, DisplayOption, SweatpantJoggerOption } from '../types';
import StoreInfoForm from './StoreInfoForm';
import CategorySection from './CategorySection';
import OrderNotesSection from './OrderNotesSection';
import Header from './Header';
import Footer from './Footer';
import '../styles/college-pages.css';

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
  onColorVersionChange: (imagePath: string, color: keyof ColorVersion, value: string) => void;
  onDisplayOptionChange: (imagePath: string, option: keyof DisplayOption, value: string) => void;
  onSweatpantJoggerOptionChange: (imagePath: string, option: keyof SweatpantJoggerOption, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
  onShirtColorComboChange: (imagePath: string, version: string, color: string, value: string) => void;
  collegeConfig?: CollegeConfig;
  college?: string;
}

const FormPage: React.FC<FormPageProps> = ({
  formData,
  onFormDataChange,
  onQuantityChange,
  onShirtVersionChange,
  onColorVersionChange,
  onDisplayOptionChange,
  onSweatpantJoggerOptionChange,
  onSubmit,
  error,
  onShirtColorComboChange,
  collegeConfig,
  college
}) => {
  const categories = collegeConfig ? collegeConfig.categories : [];
  const collegeName = collegeConfig ? collegeConfig.name : 'College';
  return (
    <div className="college-page-container">
      <div className="college-page-header">
        <Header showBackButton={true} />
      </div>
      
      <main className="college-page-main">
        <div className="college-page-title">
          <h1>{collegeName} Product Order Form</h1>
          <p>Select your merchandise and quantities below</p>
        </div>
        
        <form onSubmit={onSubmit}>
          <StoreInfoForm formData={formData} onFormDataChange={onFormDataChange} />
          
          {categories.map((category: Category) => (
            <CategorySection
              key={category.name}
              category={category}
              quantities={formData.quantities}
              shirtVersions={formData.shirtVersions}
              colorVersions={formData.colorVersions}
              shirtColorComboVersions={formData.shirtColorComboVersions}
              displayOptions={formData.displayOptions}
              sweatpantJoggerOptions={formData.sweatpantJoggerOptions}
              onQuantityChange={onQuantityChange}
              onShirtVersionChange={onShirtVersionChange}
              onColorVersionChange={onColorVersionChange}
              onShirtColorComboChange={onShirtColorComboChange}
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