import { useState } from 'react';
import { FormData, Page, ShirtVersion } from '../types';
import { validateFormData, createTemplateParams } from '../utils';
import { sendOrderEmail } from '../services/emailService';
import { categories } from '../constants';
import { getImagePath } from '../utils';

export const useOrderForm = () => {
  const [formData, setFormData] = useState<FormData>({
    storeNumber: '',
    storeManager: '',
    date: new Date().toISOString().split('T')[0],
    quantities: {} as Record<string, string>,
    shirtVersions: {} as Record<string, ShirtVersion>
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

  const handleSelectAll = () => {
    const newQuantities: Record<string, string> = {};
    const newShirtVersions: Record<string, ShirtVersion> = {};

    // Set all regular quantities to 10
    categories.forEach(category => {
      category.images.forEach(img => {
        const imagePath = getImagePath(category.path, img);
        if (category.hasShirtVersions && category.shirtVersions) {
          // For shirt categories, set all versions to 10
          const shirtVersion: ShirtVersion = {
            tshirt: '10',
            longsleeve: '10',
            hoodie: '10',
            crewneck: '10'
          };
          newShirtVersions[imagePath] = shirtVersion;
        } else {
          // For regular categories, set quantity to 10
          newQuantities[imagePath] = '10';
        }
      });
    });

    setFormData(prev => ({
      ...prev,
      quantities: newQuantities,
      shirtVersions: newShirtVersions
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
    handleSelectAll,
    handleFormSubmit,
    handleBack,
    handleBackToSummary,
    handleExit,
    handleConfirm
  };
}; 