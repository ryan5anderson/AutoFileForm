import React from 'react';
import { FormData } from '../../../shared/types';
import FormField from '../../../shared/ui/FormField';
import FormContainer from '../../../shared/ui/FormContainer';

interface StoreInfoFormProps {
  formData: FormData;
  onFormDataChange: (updates: Partial<FormData>) => void;
}

const StoreInfoForm: React.FC<StoreInfoFormProps> = ({ formData, onFormDataChange }) => {
  return (
    <FormContainer>
      <FormField
        label="Company"
        htmlFor="company"
        required
      >
        <FormField.Input
          id="company"
          type="text"
          value={formData.company}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormDataChange({ company: e.target.value })}
          required
        />
      </FormField>
      
      <FormField
        label="Store Number"
        htmlFor="storeNumber"
        required
      >
        <FormField.Input
          id="storeNumber"
          type="text"
          value={formData.storeNumber}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormDataChange({ storeNumber: e.target.value })}
          required
        />
      </FormField>
      
      <FormField
        label="Store Manager"
        htmlFor="storeManager"
        required
      >
        <FormField.Input
          id="storeManager"
          type="text"
          value={formData.storeManager}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormDataChange({ storeManager: e.target.value })}
          required
        />
      </FormField>
      
      <FormField
        label="Date"
        htmlFor="date"
        required
      >
        <FormField.Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormDataChange({ date: e.target.value })}
          required
        />
      </FormField>
    </FormContainer>
  );
};

export default StoreInfoForm; 