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
  orderedByProduct: Record<string, ApiProductSelection | ApiOrderedFields>;
}

export type ApiVariantQuantities = Record<string, number>;

export interface ApiProductSelection {
  activeVariant: string;
  variantQuantities: Record<string, ApiVariantQuantities>;
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

const sanitizeNumber = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : parseInt(String(value ?? '0'), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const buildEmptyQuantities = (sizeLabels: string[]): ApiVariantQuantities =>
  sizeLabels.reduce<ApiVariantQuantities>((acc, size) => {
    acc[size] = 0;
    return acc;
  }, {});

export const getDefaultProductSelection = (defaultVariant: string, sizeLabels: string[]): ApiProductSelection => ({
  activeVariant: defaultVariant,
  variantQuantities: {
    [defaultVariant]: buildEmptyQuantities(sizeLabels),
  },
});

export const normalizeApiProductSelection = (
  rawSelection: ApiProductSelection | ApiOrderedFields | undefined,
  defaultVariant: string,
  sizeLabelsByVariant: Record<string, string[]>
): ApiProductSelection => {
  const defaultSizes = sizeLabelsByVariant[defaultVariant] || [];
  const fallback = getDefaultProductSelection(defaultVariant, defaultSizes);

  if (!rawSelection) {
    return fallback;
  }

  // Legacy migration from ORDERED1..ORDERED5
  if ('ORDERED1' in rawSelection) {
    const next = getDefaultProductSelection(defaultVariant, defaultSizes);
    const legacyValues = [
      rawSelection.ORDERED1,
      rawSelection.ORDERED2,
      rawSelection.ORDERED3,
      rawSelection.ORDERED4,
      rawSelection.ORDERED5,
    ];
    defaultSizes.forEach((size, index) => {
      next.variantQuantities[defaultVariant][size] = sanitizeNumber(legacyValues[index]);
    });
    return next;
  }

  const activeVariant = rawSelection.activeVariant || defaultVariant;
  const next: ApiProductSelection = {
    activeVariant,
    variantQuantities: {},
  };

  Object.entries(sizeLabelsByVariant).forEach(([variant, labels]) => {
    const existing = rawSelection.variantQuantities?.[variant] || {};
    next.variantQuantities[variant] = labels.reduce<ApiVariantQuantities>((acc, size) => {
      acc[size] = sanitizeNumber(existing[size]);
      return acc;
    }, {});
  });

  if (!next.variantQuantities[activeVariant]) {
    next.variantQuantities[activeVariant] = buildEmptyQuantities(sizeLabelsByVariant[activeVariant] || defaultSizes);
  }

  return next;
};

export const getProductSelectionTotal = (selection: ApiProductSelection): number =>
  Object.values(selection.variantQuantities).reduce(
    (variantTotal, sizeMap) => variantTotal + Object.values(sizeMap).reduce((sum, qty) => sum + sanitizeNumber(qty), 0),
    0
  );

/** Check if API order has at least one product with quantity > 0 */
export const hasApiOrderProducts = (
  orderedByProduct: Record<string, ApiProductSelection | ApiOrderedFields>,
  productMap: Record<string, { defaultVariant?: string; sizeOptionsByVariant?: Record<string, string[]> }>
): boolean => {
  return Object.entries(orderedByProduct).some(([, selection]) => {
    if ('ORDERED1' in selection) return getOrderedFieldsTotal(selection) > 0;
    return getProductSelectionTotal(selection as ApiProductSelection) > 0;
  });
};
