import { useState } from 'react';
import { FormData, Page, ShirtVersion, ColorVersion, ShirtColorComboVersion, DisplayOption, SweatpantJoggerOption, Category } from '../types';
import { validateFormData, createTemplateParams } from '../utils';
import { sendOrderEmail } from '../services/emailService';

export const useOrderForm = (categories: Category[]) => {
  const [formData, setFormData] = useState<FormData>({
    company: '',
    storeNumber: '',
    storeManager: '',
    date: new Date().toISOString().split('T')[0],
    orderNotes: '',
    quantities: {} as Record<string, string>,
    shirtVersions: {} as Record<string, ShirtVersion>,
    colorVersions: {} as Record<string, ColorVersion>,
    shirtColorComboVersions: {} as Record<string, ShirtColorComboVersion>,
    displayOptions: {} as Record<string, DisplayOption>,
    sweatpantJoggerOptions: {} as Record<string, SweatpantJoggerOption>,
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

  const handleDisplayOptionChange = (imagePath: string, option: keyof DisplayOption, value: string) => {
    setFormData(prev => ({
      ...prev,
      displayOptions: {
        ...prev.displayOptions,
        [imagePath]: {
          ...prev.displayOptions?.[imagePath],
          [option]: value
        } as DisplayOption
      }
    }));
  };

  const handleSweatpantJoggerOptionChange = (imagePath: string, option: keyof SweatpantJoggerOption, value: string) => {
    setFormData(prev => ({
      ...prev,
      sweatpantJoggerOptions: {
        ...prev.sweatpantJoggerOptions,
        [imagePath]: {
          ...prev.sweatpantJoggerOptions?.[imagePath],
          [option]: value
        } as SweatpantJoggerOption
      }
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
      const templateParams = createTemplateParams(formData, categories);
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
    handleDisplayOptionChange,
    handleSweatpantJoggerOptionChange,
    handleFormSubmit,
    handleBack,
    handleBackToSummary,
    handleExit,
    handleConfirm
  };
}; 