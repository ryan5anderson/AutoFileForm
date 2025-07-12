import { useState } from 'react';
import { FormData, Page, ShirtVersion, ColorVersion, ShirtColorComboVersion } from '../types';
import { validateFormData, createTemplateParams } from '../utils';
import { sendOrderEmail } from '../services/emailService';
import { categories } from '../constants';
import { getImagePath } from '../utils';

export const useOrderForm = () => {
  const [formData, setFormData] = useState<FormData>({
    company: '',
    storeNumber: '',
    storeManager: '',
    date: new Date().toISOString().split('T')[0],
    orderNotes: '',
    quantities: {} as Record<string, string>,
    shirtVersions: {} as Record<string, ShirtVersion>,
    colorVersions: {} as Record<string, ColorVersion>,
    shirtColorComboVersions: {} as Record<string, ShirtColorComboVersion>
  });
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<Page>('form');
  const [sending, setSending] = useState(false);

  const handleFormDataChange = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleQuantityChange = (imagePath: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      quantities: {
        ...prev.quantities,
        [imagePath]: value
      }
    }));
  };

  const handleShirtVersionChange = (imagePath: string, version: keyof ShirtVersion, value: string) => {
    setFormData(prev => ({
      ...prev,
      shirtVersions: {
        ...prev.shirtVersions,
        [imagePath]: {
          ...prev.shirtVersions?.[imagePath],
          [version]: value
        } as ShirtVersion
      }
    }));
  };

  const handleColorVersionChange = (imagePath: string, color: keyof ColorVersion, value: string) => {
    setFormData(prev => ({
      ...prev,
      colorVersions: {
        ...prev.colorVersions,
        [imagePath]: {
          ...prev.colorVersions?.[imagePath],
          [color]: value
        } as ColorVersion
      }
    }));
  };

  const handleShirtColorComboChange = (imagePath: string, version: string, color: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      shirtColorComboVersions: {
        ...prev.shirtColorComboVersions,
        [imagePath]: {
          ...prev.shirtColorComboVersions?.[imagePath],
          [`${version}_${color}`]: value
        } as ShirtColorComboVersion
      }
    }));
  };

  const handleSelectAll = () => {
    const newQuantities: Record<string, string> = {};
    const newShirtVersions: Record<string, ShirtVersion> = {};
    const newColorVersions: Record<string, ColorVersion> = {};
    const newShirtColorComboVersions: Record<string, ShirtColorComboVersion> = {};

    categories.forEach(category => {
      category.images.forEach(img => {
        const imagePath = getImagePath(category.path, img);
        if (img === 'M100482538 SHHODC Hover DTF on Black or Forest .png' && category.shirtVersions && category.colorVersions) {
          // For the special shirt, set all combos to 10
          const combo: ShirtColorComboVersion = {};
          for (const color of category.colorVersions) {
            for (const version of category.shirtVersions) {
              combo[`${version}_${color}`] = '10';
            }
          }
          newShirtColorComboVersions[imagePath] = combo;
        } else if (category.hasShirtVersions && category.shirtVersions) {
          const shirtVersion: ShirtVersion = {
            tshirt: '10',
            longsleeve: '10',
            hoodie: '10',
            crewneck: '10'
          };
          newShirtVersions[imagePath] = shirtVersion;
        } else if (category.hasColorVersions && category.colorVersions) {
          const colorVersion: ColorVersion = {
            black: '10',
            forest: '10',
            white: '10',
            gray: '10'
          };
          newColorVersions[imagePath] = colorVersion;
        } else {
          newQuantities[imagePath] = '10';
        }
      });
    });

    setFormData(prev => ({
      ...prev,
      quantities: newQuantities,
      shirtVersions: newShirtVersions,
      colorVersions: newColorVersions,
      shirtColorComboVersions: newShirtColorComboVersions
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateFormData(formData);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setPage('summary');
  };

  const handleBack = () => {
    setPage('form');
  };

  const handleBackToSummary = () => {
    setPage('summary');
  };

  const handleExit = () => {
    setPage('thankyou');
  };

  const handleConfirm = async () => {
    if (!window.confirm('Are you sure you want to submit this order?')) return;
    setSending(true);
    
    try {
      const templateParams = createTemplateParams(formData);
      await sendOrderEmail(templateParams);
      setPage('receipt');
    } catch (err) {
      console.error('Email error:', err);
      alert('Failed to send email. Please check your EmailJS configuration and try again.');
    } finally {
      setSending(false);
    }
  };

  return {
    formData,
    error,
    page,
    sending,
    handleFormDataChange,
    handleQuantityChange,
    handleShirtVersionChange,
    handleColorVersionChange,
    handleShirtColorComboChange,
    handleSelectAll,
    handleFormSubmit,
    handleBack,
    handleBackToSummary,
    handleExit,
    handleConfirm
  };
}; 