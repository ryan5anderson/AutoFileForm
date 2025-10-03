import React, { createContext, useContext, ReactNode } from 'react';
import { useOrderForm } from '../features/hooks';
import { Category, FormData } from '../types';

interface OrderFormContextType {
  formData: FormData;
  error: string | null;
  page: string;
  sending: boolean;
  handleFormDataChange: (updates: Partial<FormData>) => void;
  handleQuantityChange: (imagePath: string, value: string) => void;
  handleShirtVersionChange: (imagePath: string, version: any, value: string) => void;
  handleSizeCountsChange: (imagePath: string, version: any, counts: any) => void;
  handleColorVersionChange: (imagePath: string, color: any, value: string) => void;
  handleShirtColorComboChange: (imagePath: string, version: string, color: string, value: string) => void;
  handleShirtColorComboSizeCountsChange: (imagePath: string, version: string, color: string, counts: any) => void;
  handleDisplayOptionChange: (imagePath: string, option: any, value: string) => void;
  handleSweatpantJoggerOptionChange: (imagePath: string, option: any, value: string) => void;
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

