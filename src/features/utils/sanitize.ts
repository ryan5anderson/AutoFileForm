import { FormData } from '../../types';

const MULTI_SPACE = /\s+/g;
const UNSAFE_TAG_CHARS = /[<>]/g;

const removeControlCharsExceptNewlines = (value: string): string => {
  return Array.from(value)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code === 10 || code === 13 || (code >= 32 && code !== 127);
    })
    .join('');
};

const cleanBaseText = (value: string): string => {
  return removeControlCharsExceptNewlines(value)
    .replace(UNSAFE_TAG_CHARS, '')
    .trim();
};

export const sanitizeSingleLineInput = (value: string): string => {
  return cleanBaseText(value).replace(MULTI_SPACE, ' ');
};

export const sanitizeMultiLineInput = (value: string): string => {
  return cleanBaseText(value)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
};

export const sanitizeFormDataUpdates = (updates: Partial<FormData>): Partial<FormData> => {
  const next: Partial<FormData> = { ...updates };

  if (typeof next.company === 'string') {
    next.company = sanitizeSingleLineInput(next.company);
  }
  if (typeof next.storeNumber === 'string') {
    next.storeNumber = sanitizeSingleLineInput(next.storeNumber);
  }
  if (typeof next.storeManager === 'string') {
    next.storeManager = sanitizeSingleLineInput(next.storeManager);
  }
  if (typeof next.orderedBy === 'string') {
    next.orderedBy = sanitizeSingleLineInput(next.orderedBy);
  }
  if (typeof next.orderNotes === 'string') {
    next.orderNotes = sanitizeMultiLineInput(next.orderNotes);
  }

  return next;
};

export const sanitizeFormDataTextFields = (formData: FormData): FormData => {
  return {
    ...formData,
    company: sanitizeSingleLineInput(formData.company),
    storeNumber: sanitizeSingleLineInput(formData.storeNumber),
    storeManager: sanitizeSingleLineInput(formData.storeManager),
    orderedBy: sanitizeSingleLineInput(formData.orderedBy),
    orderNotes: sanitizeMultiLineInput(formData.orderNotes),
  };
};
