import React, { createContext, useContext, useCallback, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import {
  getProductSelectionTotal,
  loadApiSchoolOrderState,
  normalizeApiProductSelection,
  saveApiSchoolOrderState,
  type ApiProductSelection,
} from '../features/utils/apiOrderState';
import {
  buildApiOrderCategoryModel,
  fetchApiSchoolPageData,
  getSchoolPageFromCache,
  type ApiSchoolPageData,
} from '../services/collegeApiService';
import { ApiOrderProduct, Category, FormData } from '../types';

export interface ValidateApiOrderResult {
  invalidProductPaths: string[];
  validProductPaths: string[];
  errorMessage: string | null;
}

function validateApiOrder(
  orderedByProduct: Record<string, ApiProductSelection>,
  productMap: Record<string, ApiOrderProduct>,
  categories: Category[]
): ValidateApiOrderResult {
  const invalidProductPaths: string[] = [];
  const validProductPaths: string[] = [];

  categories.forEach((category) => {
    category.images.forEach((imageName) => {
      const imagePath = `${category.path}/${imageName}`;
      const product = productMap[imageName];
      const selection = orderedByProduct[imageName];

      if (!product) return;

      const defaultVariant = product.defaultVariant || product.variantOptions?.[0] || 'default';
      const sizeLabelsByVariant = product.sizeOptionsByVariant || { [defaultVariant]: product.sizeLabels };
      const normalized = normalizeApiProductSelection(selection, defaultVariant, sizeLabelsByVariant);

      const total = getProductSelectionTotal(normalized);
      if (total <= 0) return;

      const variantOptions = product.variantOptions?.length ? product.variantOptions : [defaultVariant];
      let hasError = false;

      for (const variant of variantOptions) {
        const packSize = product.packSizeByVariant?.[variant] ?? 1;
        const allowAny = product.allowAnyQuantityByVariant?.[variant] ?? false;
        const quantities = normalized.variantQuantities[variant] || {};
        const variantTotal = Object.values(quantities).reduce((s, q) => s + (Number(q) || 0), 0);

        if (variantTotal > 0 && !allowAny && packSize > 0 && variantTotal % packSize !== 0) {
          hasError = true;
          break;
        }
      }

      if (hasError) {
        invalidProductPaths.push(imagePath);
      } else {
        validProductPaths.push(imagePath);
      }
    });
  });

  const errorMessage =
    invalidProductPaths.length > 0
      ? 'Some products have invalid pack quantities. Please adjust so each variant total is a multiple of the pack size.'
      : null;

  return { invalidProductPaths, validProductPaths, errorMessage };
}

interface ApiCollegeOrderContextValue {
  orderTemplateId: string | undefined;
  loading: boolean;
  error: string | null;
  categories: Category[];
  productMap: Record<string, ApiOrderProduct>;
  rawPageData: ApiSchoolPageData | null;
  formData: FormData;
  orderedByProduct: Record<string, ApiProductSelection>;
  invalidProductPaths: string[];
  validProductPaths: string[];
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  updateOrderedByProduct: (productId: string, selection: ApiProductSelection) => void;
}

const ApiCollegeOrderContext = createContext<ApiCollegeOrderContextValue | null>(null);

const createInitialFormData = (): FormData => ({
  company: '',
  storeNumber: '',
  storeManager: '',
  orderedBy: '',
  date: new Date().toISOString().split('T')[0] || '',
  orderNotes: '',
  quantities: {},
});

interface ApiCollegeOrderProviderProps {
  children: React.ReactNode;
}

export const ApiCollegeOrderProvider: React.FC<ApiCollegeOrderProviderProps> = ({ children }) => {
  const { orderTemplateId } = useParams<{ orderTemplateId: string }>();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [productMap, setProductMap] = React.useState<Record<string, ApiOrderProduct>>({});
  const [rawPageData, setRawPageData] = React.useState<ApiSchoolPageData | null>(null);
  const [formData, setFormData] = React.useState<FormData>(createInitialFormData);
  const [orderedByProduct, setOrderedByProduct] = React.useState<Record<string, ApiProductSelection>>({});

  const validationResult = useMemo(
    () => validateApiOrder(orderedByProduct, productMap, categories),
    [orderedByProduct, productMap, categories]
  );

  const updateOrderedByProduct = useCallback((productId: string, selection: ApiProductSelection) => {
    setOrderedByProduct((prev) => ({ ...prev, [productId]: selection }));
  }, []);

  useEffect(() => {
    const id = orderTemplateId;
    if (!id) {
      setLoading(false);
      return;
    }

    const load = async () => {
      const cached = getSchoolPageFromCache(id);
      if (cached) {
        setRawPageData(cached);
        const model = buildApiOrderCategoryModel(cached.items);
        setCategories(model.categories);
        setProductMap(model.productMap);
        const stored = loadApiSchoolOrderState(id);
        if (stored) {
          setFormData((prev) => ({
            ...prev,
            company: stored.formData.company ?? prev.company,
            storeNumber: stored.formData.storeNumber ?? prev.storeNumber,
            storeManager: stored.formData.storeManager ?? prev.storeManager,
            orderedBy: stored.formData.orderedBy ?? prev.orderedBy,
            date: stored.formData.date ?? prev.date,
          }));
          const normalized: Record<string, ApiProductSelection> = {};
          Object.keys(model.productMap).forEach((productId) => {
            const product = model.productMap[productId];
            const defaultVariant = product.defaultVariant || 'default';
            const sizeLabelsByVariant =
              product.sizeOptionsByVariant || { [product.defaultVariant || 'default']: product.sizeLabels };
            normalized[productId] = normalizeApiProductSelection(
              stored.orderedByProduct?.[productId],
              defaultVariant,
              sizeLabelsByVariant
            );
          });
          setOrderedByProduct(normalized);
        } else {
          setOrderedByProduct({});
        }
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data } = await fetchApiSchoolPageData(id);
        setRawPageData(data);
        const model = buildApiOrderCategoryModel(data.items);
        setCategories(model.categories);
        setProductMap(model.productMap);
        const stored = loadApiSchoolOrderState(id);
        if (stored) {
          setFormData((prev) => ({
            ...prev,
            company: stored.formData.company ?? prev.company,
            storeNumber: stored.formData.storeNumber ?? prev.storeNumber,
            storeManager: stored.formData.storeManager ?? prev.storeManager,
            orderedBy: stored.formData.orderedBy ?? prev.orderedBy,
            date: stored.formData.date ?? prev.date,
          }));
          const normalized: Record<string, ApiProductSelection> = {};
          Object.keys(model.productMap).forEach((productId) => {
            const product = model.productMap[productId];
            const defaultVariant = product.defaultVariant || 'default';
            const sizeLabelsByVariant =
              product.sizeOptionsByVariant || { [product.defaultVariant || 'default']: product.sizeLabels };
            normalized[productId] = normalizeApiProductSelection(
              stored.orderedByProduct?.[productId],
              defaultVariant,
              sizeLabelsByVariant
            );
          });
          setOrderedByProduct(normalized);
        } else {
          setOrderedByProduct({});
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [orderTemplateId]);

  useEffect(() => {
    if (!orderTemplateId || loading || Object.keys(productMap).length === 0) return;
    saveApiSchoolOrderState(orderTemplateId, {
      formData: {
        company: formData.company,
        storeNumber: formData.storeNumber,
        storeManager: formData.storeManager,
        orderedBy: formData.orderedBy,
        date: formData.date,
      },
      orderedByProduct,
    });
  }, [orderTemplateId, loading, productMap, formData.company, formData.date, formData.orderedBy, formData.storeManager, formData.storeNumber, orderedByProduct]);

  const value = useMemo(
    () => ({
      orderTemplateId,
      loading,
      error,
      categories,
      productMap,
      rawPageData,
      formData,
      orderedByProduct,
      invalidProductPaths: validationResult.invalidProductPaths,
      validProductPaths: validationResult.validProductPaths,
      setFormData,
      updateOrderedByProduct,
    }),
    [
      orderTemplateId,
      loading,
      error,
      categories,
      productMap,
      rawPageData,
      formData,
      orderedByProduct,
      validationResult.invalidProductPaths,
      validationResult.validProductPaths,
      updateOrderedByProduct,
    ]
  );

  return <ApiCollegeOrderContext.Provider value={value}>{children}</ApiCollegeOrderContext.Provider>;
};

export const useApiCollegeOrder = (): ApiCollegeOrderContextValue => {
  const ctx = useContext(ApiCollegeOrderContext);
  if (!ctx) {
    throw new Error('useApiCollegeOrder must be used within ApiCollegeOrderProvider');
  }
  return ctx;
};
