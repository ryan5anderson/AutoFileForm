import React from 'react';
import { FormData } from '../../../shared/types';
import FormField from '../../../shared/ui/FormField';
import FormContainer from '../../../shared/ui/FormContainer';

interface OrderNotesSectionProps {
  formData: FormData;
  onFormDataChange: (updates: Partial<FormData>) => void;
}

const OrderNotesSection: React.FC<OrderNotesSectionProps> = ({ formData, onFormDataChange }) => {
  return (
    <FormContainer>
      <h2>Order Notes</h2>
      
      <FormField
        label="Additional Comments"
        htmlFor="orderNotes"
        helpText="Enter any additional comments, special requests, or notes for this order..."
      >
        <FormField.Textarea
          id="orderNotes"
          value={formData.orderNotes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onFormDataChange({ orderNotes: e.target.value })}
          placeholder="Enter any additional comments, special requests, or notes for this order..."
          autoResize
        />
      </FormField>
    </FormContainer>
  );
};

export default OrderNotesSection; 