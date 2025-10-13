import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FormData, Page, ShirtVersion, DisplayOption, SweatpantJoggerOption, PantOption, Category, SizeCounts, ColorOption, ShirtColorSizeCounts } from '../../types';
import { validateFormData, validateQuantities, createTemplateParams } from '../utils/index';
import { sendOrderEmail } from '../../services/emailService';

export const useOrderForm = (categories: Category[]) => {
  // Store categories for validation
  const categoriesRef = categories;
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
  const [invalidProductPaths, setInvalidProductPaths] = useState<string[]>([]);
  const [validProductPaths, setValidProductPaths] = useState<string[]>([]);
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

  // Update validation in real-time when form data changes
  useEffect(() => {
    const validationResult = validateQuantities(formData, categoriesRef);
    setInvalidProductPaths(validationResult.invalidProductPaths);
    setError(validationResult.errorMessage);

    // Track products with valid quantities
    const validPaths: string[] = [];
    const allProductPaths = new Set([
      ...Object.keys(formData.quantities || {}),
      ...Object.keys(formData.shirtSizeCounts || {}),
      ...Object.keys(formData.colorOptions || {}),
      ...Object.keys(formData.shirtColorSizeCounts || {}),
      ...Object.keys(formData.pantOptions || {}),
      ...Object.keys(formData.sweatpantJoggerOptions || {})
    ]);

    allProductPaths.forEach(imagePath => {
      const hasQuantity = (
        (formData.quantities?.[imagePath] && parseInt(formData.quantities[imagePath]) > 0) ||
        (formData.shirtSizeCounts?.[imagePath] && Object.values(formData.shirtSizeCounts[imagePath]).some(counts => Object.values(counts).some(count => count > 0))) ||
        (formData.colorOptions?.[imagePath] && Object.values(formData.colorOptions[imagePath]).some(qty => parseInt(qty) > 0)) ||
        (formData.shirtColorSizeCounts?.[imagePath] && Object.values(formData.shirtColorSizeCounts[imagePath]).some(colorData => Object.values(colorData).some(counts => Object.values(counts).some(count => count > 0)))) ||
        (formData.pantOptions?.[imagePath] && (
          (formData.pantOptions[imagePath].sweatpants && Object.values(formData.pantOptions[imagePath].sweatpants!).some(counts => Object.values(counts).some(count => count > 0))) ||
          (formData.pantOptions[imagePath].joggers && Object.values(formData.pantOptions[imagePath].joggers!).some(counts => Object.values(counts).some(count => count > 0)))
        )) ||
        (formData.sweatpantJoggerOptions?.[imagePath] && Object.values(formData.sweatpantJoggerOptions[imagePath]).some(qty => parseInt(qty) > 0))
      );

      if (hasQuantity && !validationResult.invalidProductPaths.includes(imagePath)) {
        validPaths.push(imagePath);
      }
    });

    setValidProductPaths(validPaths);
  }, [formData, categoriesRef]);

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

    // Removed all pack size validation - rely on product configuration instead
    // Only check basic form requirements

    const formValidationResult = validateFormData(formData, categoriesRef);
    setInvalidProductPaths(formValidationResult.invalidProductPaths);
    if (!formValidationResult.isValid) {
      setError(formValidationResult.errorMessage);
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
    // Keep validation state when going back to form
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
    invalidProductPaths,
    validProductPaths,
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