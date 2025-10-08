import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FormData, Page, ShirtVersion, DisplayOption, SweatpantJoggerOption, PantOption, Category, SizeCounts, ColorOption, ShirtColorSizeCounts } from '../../types';
import { validateFormData, createTemplateParams } from '../utils/index';
import { sendOrderEmail } from '../../services/emailService';
import { getPackSize } from '../../config/packSizes';

export const useOrderForm = (categories: Category[]) => {
  const navigate = useNavigate();
  const { college } = useParams();
  const location = useLocation();
  const [formData, setFormData] = useState<FormData>({
    company: '',
    storeNumber: '',
    storeManager: '',
    date: new Date().toISOString().split('T')[0],
    orderNotes: '',
    quantities: {} as Record<string, string>,
    shirtVersions: {} as Record<string, ShirtVersion>,
    displayOptions: {} as Record<string, DisplayOption>,
    sweatpantJoggerOptions: {} as Record<string, SweatpantJoggerOption>,
    pantOptions: {} as Record<string, PantOption>,
    shirtSizeCounts: {} as Record<string, Partial<Record<keyof ShirtVersion, SizeCounts>>>,
    colorOptions: {} as Record<string, ColorOption>,
    shirtColorSizeCounts: {} as ShirtColorSizeCounts,
  });
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<Page>('form');
  const [sending, setSending] = useState(false);

  // Reset page state when URL changes
  useEffect(() => {
    const isSummaryPage = location.pathname.endsWith('/summary');
    const isReceiptPage = location.pathname.endsWith('/receipt');
    const isThankYouPage = location.pathname.endsWith('/thankyou');
    
    if (!isSummaryPage && page === 'summary') {
      setPage('form');
    }
    
    if (isReceiptPage && page !== 'receipt') {
      setPage('receipt');
    }
    
    if (isThankYouPage && page !== 'thankyou') {
      setPage('thankyou');
    }
  }, [location.pathname, page]);

  const handleFormDataChange = (updates: Partial<FormData>) => {
    setFormData((prev: FormData) => ({ ...prev, ...updates }));
  };

  const handleQuantityChange = (imagePath: string, value: string) => {
    setFormData((prev: FormData) => ({
      ...prev,
      quantities: {
        ...prev.quantities,
        [imagePath]: value
      }
    }));
  };

  const handleShirtVersionChange = (imagePath: string, version: keyof ShirtVersion, value: string) => {
    setFormData((prev: FormData) => ({
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

  const handleSizeCountsChange = (imagePath: string, version: keyof ShirtVersion, counts: SizeCounts) => {
    setFormData((prev: FormData) => ({
      ...prev,
      shirtSizeCounts: {
        ...prev.shirtSizeCounts,
        [imagePath]: {
          ...(prev.shirtSizeCounts?.[imagePath] || {}),
          [version]: counts,
        },
      },
    }));
  };

  const handleDisplayOptionChange = (imagePath: string, option: keyof DisplayOption, value: string) => {
    setFormData((prev: FormData) => ({
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
    setFormData((prev: FormData) => ({
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

  const handlePantOptionChange = (imagePath: string, option: PantOption) => {
    setFormData((prev: FormData) => ({
      ...prev,
      pantOptions: {
        ...prev.pantOptions,
        [imagePath]: option
      }
    }));
  };

  const handleColorOptionChange = (imagePath: string, color: string, value: string) => {
    setFormData((prev: FormData) => ({
      ...prev,
      colorOptions: {
        ...prev.colorOptions,
        [imagePath]: {
          ...(prev.colorOptions?.[imagePath] || {}),
          [color]: value
        }
      }
    }));
  };

  const handleShirtColorSizeCountsChange = (imagePath: string, version: keyof ShirtVersion, color: string, counts: SizeCounts) => {
    setFormData((prev: FormData) => ({
      ...prev,
      shirtColorSizeCounts: {
        ...prev.shirtColorSizeCounts,
        [imagePath]: {
          ...(prev.shirtColorSizeCounts?.[imagePath] || {}),
          [version]: {
            ...(prev.shirtColorSizeCounts?.[imagePath]?.[version] || {}),
            [color]: counts
          }
        }
      }
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dynamic pack size validation for shirt size counts
    let validationError: string | null = null;
    
    Object.entries(formData.shirtSizeCounts || {}).forEach(([imagePath, byVersion]) => {
      // Extract category path and product name from imagePath
      const pathParts = imagePath.split('/');
      const categoryPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : pathParts[0];
      const productName = pathParts[pathParts.length - 1];
      
      Object.entries(byVersion || {}).forEach(([version, counts]) => {
        const packSize = getPackSize(categoryPath, version, productName);
        const total = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;
        if (total > 0 && total % packSize !== 0) {
          validationError = `Please ensure all selected garment sizes total to multiples of ${packSize}.`;
        }
      });
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    const formValidationError = validateFormData(formData);
    if (formValidationError) {
      setError(formValidationError);
      return;
    }
    setError(null);
    setPage('summary');
    // Navigate to summary URL
    if (college) {
      navigate(`/${college}/summary`);
    }
  };

  const handleBack = () => {
    setPage('form');
    // Navigate back to form URL
    if (college) {
      navigate(`/${college}`);
    }
  };

  const handleBackToSummary = () => {
    setPage('summary');
    // Navigate to summary URL
    if (college) {
      navigate(`/${college}/summary`);
    }
  };

  const handleExit = () => {
    setPage('thankyou');
    // Navigate to thankyou URL
    if (college) {
      navigate(`/${college}/thankyou`);
    }
  };

  const handleConfirm = async () => {
    if (!window.confirm('Are you sure you want to submit this order?')) return;
    setSending(true);
    
    try {
      const templateParams = createTemplateParams(formData, categories);
      await sendOrderEmail(templateParams);
      setPage('receipt');
      // Navigate to receipt URL
      if (college) {
        navigate(`/${college}/receipt`);
      }
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
    handleSizeCountsChange,
    handleDisplayOptionChange,
    handleSweatpantJoggerOptionChange,
    handlePantOptionChange,
    handleColorOptionChange,
    handleShirtColorSizeCountsChange,
    handleFormSubmit,
    handleBack,
    handleBackToSummary,
    handleExit,
    handleConfirm
  };
}; 