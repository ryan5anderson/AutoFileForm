import { FormData } from '../../types';

export interface ApiOrderedFields {
  ORDERED1: string;
  ORDERED2: string;
  ORDERED3: string;
  ORDERED4: string;
  ORDERED5: string;
}

export interface ApiSchoolOrderState {
  formData: Pick<FormData, 'company' | 'storeNumber' | 'storeManager' | 'orderedBy' | 'date'>;
  orderedByProduct: Record<string, ApiOrderedFields>;
}

export const getApiSchoolStorageKey = (orderTemplateId: string): string =>
  `apiSchoolOrder_${orderTemplateId}`;

export const getDefaultOrderedFields = (): ApiOrderedFields => ({
  ORDERED1: '0',
  ORDERED2: '0',
  ORDERED3: '0',
  ORDERED4: '0',
  ORDERED5: '0',
});

export const loadApiSchoolOrderState = (orderTemplateId: string): ApiSchoolOrderState | null => {
  try {
    const raw = localStorage.getItem(getApiSchoolStorageKey(orderTemplateId));
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as ApiSchoolOrderState;
  } catch (error) {
    console.error('Failed to load API school order state:', error);
    return null;
  }
};

export const saveApiSchoolOrderState = (orderTemplateId: string, state: ApiSchoolOrderState): void => {
  try {
    localStorage.setItem(getApiSchoolStorageKey(orderTemplateId), JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save API school order state:', error);
  }
};

export const getOrderedFieldsTotal = (fields: ApiOrderedFields): number =>
  (parseInt(fields.ORDERED1, 10) || 0) +
  (parseInt(fields.ORDERED2, 10) || 0) +
  (parseInt(fields.ORDERED3, 10) || 0) +
  (parseInt(fields.ORDERED4, 10) || 0) +
  (parseInt(fields.ORDERED5, 10) || 0);
