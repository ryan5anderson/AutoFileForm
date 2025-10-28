import React, { createContext, useContext, ReactNode } from 'react';

import { useOrderForm } from '../features/hooks';
import { Category, FormData, PantOption } from '../types';

interface OrderFormContextType {
  formData: FormData;
  error: string | null;
  invalidProductPaths: string[];
  validProductPaths: string[];
  page: string;
  sending: boolean;
  handleFormDataChange: (updates: Partial<FormData>) => void;
  handleQuantityChange: (imagePath: string, value: string) => void;
  handleShirtVersionChange: (imagePath: string, version: any, value: string) => void;
  handleSizeCountsChange: (imagePath: string, version: any, counts: any) => void;
  handleDisplayOptionChange: (imagePath: string, option: any, value: string) => void;
  handleSweatpantJoggerOptionChange: (imagePath: string, option: any, value: string) => void;
  handlePantOptionChange: (imagePath: string, option: PantOption) => void;
  handleColorOptionChange: (imagePath: string, color: string, value: string) => void;
  handleShirtColorSizeCountsChange: (imagePath: string, version: any, color: string, counts: any) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  handleBack: () => void;
  handleBackToSummary: () => void;
  handleExit: () => void;
  handleConfirm: () => void;
}

const OrderFormContext = createContext<OrderFormContextType | null>(null);

interface OrderFormProviderProps {
  children: ReactNode;
  categories: Category[];
}

export const OrderFormProvider: React.FC<OrderFormProviderProps> = ({ children, categories }) => {
  const orderFormState = useOrderForm(categories);

  return (
    <OrderFormContext.Provider value={orderFormState}>
      {children}
    </OrderFormContext.Provider>
  );
};

export const useOrderFormContext = () => {
  const context = useContext(OrderFormContext);
  if (!context) {
    throw new Error('useOrderFormContext must be used within OrderFormProvider');
  }
  return context;
};

