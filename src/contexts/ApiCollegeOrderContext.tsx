import React, { createContext, useContext, useCallback, useMemo, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import {
  getProductSelectionTotal,
  loadApiSchoolOrderState,
  normalizeApiProductSelection,
  saveApiSchoolOrderState,
  type ApiProductSelection,
  type ApiSchoolOrderState,
} from '../features/utils/apiOrderState';
import {
  STORE_MANAGER_LINK_COMPANY_PARAM,
  STORE_MANAGER_LINK_FLAG_PARAM,
  STORE_MANAGER_LINK_PO_NUMBER_PARAM,
  STORE_MANAGER_LINK_STORE_NUMBER_PARAM,
  normalizeApiOrderTemplateId,
} from '../features/utils/storeManagerLink';
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
  sourceToGroupKeyMap: Record<string, string>;
  rawPageData: ApiSchoolPageData | null;
  formData: FormData;
  orderedByProduct: Record<string, ApiProductSelection>;
  invalidProductPaths: string[];
  validProductPaths: string[];
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  updateOrderedByProduct: (productId: string, selection: ApiProductSelection) => void;
  isStoreManagerLink: boolean;
}

const ApiCollegeOrderContext = createContext<ApiCollegeOrderContextValue | null>(null);

const createInitialFormData = (): FormData => ({
  company: '',
  storeNumber: '',
  poNumber: '',
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
  const { orderTemplateId: orderTemplateIdParam } = useParams<{ orderTemplateId: string }>();
  const orderTemplateId = normalizeApiOrderTemplateId(orderTemplateIdParam);
  const [searchParams] = useSearchParams();
  const isStoreManagerLink = searchParams.get(STORE_MANAGER_LINK_FLAG_PARAM) === '1';
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [productMap, setProductMap] = React.useState<Record<string, ApiOrderProduct>>({});
  const [sourceToGroupKeyMap, setSourceToGroupKeyMap] = React.useState<Record<string, string>>({});
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
      setRawPageData(null);
      setCategories([]);
      setProductMap({});
      setSourceToGroupKeyMap({});
      setOrderedByProduct({});
      setError(
        'Could not determine which school to load. The URL should look like /api-school/YOUR_SCHOOL_ID. Go back to the school list or use Send order URL to copy a fresh link.'
      );
      setLoading(false);
      return;
    }

    setError(null);

    const mergeFormState = (stored: ApiSchoolOrderState | null) => {
      setFormData((prev) => {
        let next = { ...prev };
        if (stored) {
          next = {
            ...next,
            company: stored.formData.company ?? next.company,
            storeNumber: stored.formData.storeNumber ?? next.storeNumber,
            poNumber: stored.formData.poNumber ?? next.poNumber,
            storeManager: stored.formData.storeManager ?? next.storeManager,
            orderedBy: stored.formData.orderedBy ?? next.orderedBy,
            date: stored.formData.date ?? next.date,
          };
        }
        if (isStoreManagerLink) {
          next = {
            ...next,
            company: searchParams.get(STORE_MANAGER_LINK_COMPANY_PARAM) ?? '',
            storeNumber: searchParams.get(STORE_MANAGER_LINK_STORE_NUMBER_PARAM) ?? '',
            poNumber: searchParams.get(STORE_MANAGER_LINK_PO_NUMBER_PARAM) ?? '',
          };
        }
        return next;
      });
    };

    const applyStoredProducts = (
      stored: ApiSchoolOrderState | null,
      modelProductMap: Record<string, ApiOrderProduct>
    ) => {
      if (stored) {
        const normalized: Record<string, ApiProductSelection> = {};
        Object.keys(modelProductMap).forEach((productId) => {
          const product = modelProductMap[productId];
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
    };

    const load = async () => {
      const cached = getSchoolPageFromCache(id);
      if (cached) {
        setRawPageData(cached);
        const model = buildApiOrderCategoryModel(cached.items);
        setCategories(model.categories);
        setProductMap(model.productMap);
        setSourceToGroupKeyMap(model.sourceToGroupKeyMap);
        const stored = loadApiSchoolOrderState(id);
        mergeFormState(stored);
        applyStoredProducts(stored, model.productMap);
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
        setSourceToGroupKeyMap(model.sourceToGroupKeyMap);
        const stored = loadApiSchoolOrderState(id);
        mergeFormState(stored);
        applyStoredProducts(stored, model.productMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [orderTemplateId, searchParams, isStoreManagerLink]);

  useEffect(() => {
    if (!orderTemplateId || loading || Object.keys(productMap).length === 0) return;
    saveApiSchoolOrderState(orderTemplateId, {
      formData: {
        company: formData.company,
        storeNumber: formData.storeNumber,
        poNumber: formData.poNumber,
        storeManager: formData.storeManager,
        orderedBy: formData.orderedBy,
        date: formData.date,
      },
      orderedByProduct,
    });
  }, [orderTemplateId, loading, productMap, formData.company, formData.storeNumber, formData.poNumber, formData.storeManager, formData.orderedBy, formData.date, orderedByProduct]);

  const value = useMemo(
    () => ({
      orderTemplateId,
      loading,
      error,
      categories,
      productMap,
      sourceToGroupKeyMap,
      rawPageData,
      formData,
      orderedByProduct,
      invalidProductPaths: validationResult.invalidProductPaths,
      validProductPaths: validationResult.validProductPaths,
      setFormData,
      updateOrderedByProduct,
      isStoreManagerLink,
    }),
    [
      orderTemplateId,
      loading,
      error,
      categories,
      productMap,
      sourceToGroupKeyMap,
      rawPageData,
      formData,
      orderedByProduct,
      validationResult.invalidProductPaths,
      validationResult.validProductPaths,
      updateOrderedByProduct,
      isStoreManagerLink,
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
