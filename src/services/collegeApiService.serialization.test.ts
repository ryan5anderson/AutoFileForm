import { describe, expect, it } from '@jest/globals';

import {
  buildApiOrderCategoryModel,
  buildApiOrderPayload,
  type ApiSchoolPageData,
  type OrderItem,
} from './collegeApiService';

describe('buildApiOrderPayload size-to-raw-row serialization', () => {
  const rawItems: OrderItem[] = [
    {
      ORDER_NUM: 'SH2COC',
      DESIGN_NUM: 'D1',
      ITEM_ID: 'A',
      SHIRTNAME: 'Classic Tee',
      Expr1: 'Black',
      STYLE_NUM: '3930R  ',
      size2: 'SM',
      size3: 'MD',
      size4: 'LG',
      size5: 'XL',
      UNITPRICE: 10,
    },
    {
      ORDER_NUM: 'SH2COC',
      DESIGN_NUM: 'D1',
      ITEM_ID: 'B',
      SHIRTNAME: 'Classic Tee',
      Expr1: 'Black',
      STYLE_NUM: '3930R2X',
      size5: '2XL',
      UNITPRICE: 10,
    },
    {
      ORDER_NUM: 'SH2COC',
      DESIGN_NUM: 'D1',
      ITEM_ID: 'C',
      SHIRTNAME: 'Classic Tee',
      Expr1: 'Black',
      STYLE_NUM: '3930R3X',
      size5: '3XL',
      UNITPRICE: 10,
    },
  ];

  it('maps grouped S/M/L/XL/XXL/XXXL selections back to the correct raw rows and ORDERED fields', () => {
    const model = buildApiOrderCategoryModel(rawItems);
    const groupKey = Object.keys(model.productMap)[0];
    expect(groupKey).toBeTruthy();

    const groupedProduct = model.productMap[groupKey];
    const activeVariant = groupedProduct.defaultVariant || groupedProduct.variantOptions?.[0] || 'default';

    const payload = buildApiOrderPayload(
      {
        orderTemplateId: 'TEMPLATE-1',
        school: null,
        items: rawItems,
        fetchedAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
      } as ApiSchoolPageData,
      {
        [groupKey]: {
          activeVariant,
          variantQuantities: {
            [activeVariant]: {
              S: 1,
              M: 1,
              L: 1,
              XL: 1,
              XXL: 1,
              XXXL: 1,
            },
          },
        },
      },
      model.productMap,
      model.sourceToGroupKeyMap,
      {
        company: 'Store',
        storeNumber: '1',
        poNumber: '12345678',
        orderedBy: 'Manager',
        date: '2026-03-19',
        orderNotes: '',
      }
    );

    expect(payload).not.toBeNull();
    const items = payload?.items || [];
    const byStyle = new Map(items.map((item) => [String(item.STYLE_NUM || '').trim(), item]));

    const baseRow = byStyle.get('3930R');
    expect(baseRow).toBeDefined();
    expect(baseRow?.ORDERED1).toBe('0');
    expect(baseRow?.ORDERED2).toBe('1');
    expect(baseRow?.ORDERED3).toBe('1');
    expect(baseRow?.ORDERED4).toBe('1');
    expect(baseRow?.ORDERED5).toBe('1');

    const row2X = byStyle.get('3930R2X');
    expect(row2X).toBeDefined();
    expect(row2X?.ORDERED1).toBe('0');
    expect(row2X?.ORDERED2).toBe('0');
    expect(row2X?.ORDERED3).toBe('0');
    expect(row2X?.ORDERED4).toBe('0');
    expect(row2X?.ORDERED5).toBe('1');

    const row3X = byStyle.get('3930R3X');
    expect(row3X).toBeDefined();
    expect(row3X?.ORDERED1).toBe('0');
    expect(row3X?.ORDERED2).toBe('0');
    expect(row3X?.ORDERED3).toBe('0');
    expect(row3X?.ORDERED4).toBe('0');
    expect(row3X?.ORDERED5).toBe('1');
  });

  it('serializes ORDERED fields even when quantities are stored under a non-default variant key', () => {
    const model = buildApiOrderCategoryModel(rawItems);
    const groupKey = Object.keys(model.productMap)[0];
    expect(groupKey).toBeTruthy();

    const groupedProduct = model.productMap[groupKey];
    const nonDefaultVariant = `${groupedProduct.defaultVariant || 'default'}-alt`;

    const payload = buildApiOrderPayload(
      {
        orderTemplateId: 'TEMPLATE-1',
        school: null,
        items: rawItems,
        fetchedAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
      } as ApiSchoolPageData,
      {
        [groupKey]: {
          activeVariant: nonDefaultVariant,
          variantQuantities: {
            [nonDefaultVariant]: {
              S: 2,
              M: 1,
              L: 1,
              XL: 1,
              XXL: 1,
              XXXL: 1,
            },
          },
        },
      },
      model.productMap,
      model.sourceToGroupKeyMap,
      {
        company: 'Store',
        storeNumber: '1',
        poNumber: '12345678',
        orderedBy: 'Manager',
        date: '2026-03-19',
        orderNotes: '',
      }
    );

    expect(payload).not.toBeNull();
    const items = payload?.items || [];
    const byStyle = new Map(items.map((item) => [String(item.STYLE_NUM || '').trim(), item]));

    const baseRow = byStyle.get('3930R');
    expect(baseRow).toBeDefined();
    expect(baseRow?.ORDERED2).toBe('2');
    expect(baseRow?.ORDERED3).toBe('1');
    expect(baseRow?.ORDERED4).toBe('1');
    expect(baseRow?.ORDERED5).toBe('1');

    const row2X = byStyle.get('3930R2X');
    expect(row2X).toBeDefined();
    expect(row2X?.ORDERED5).toBe('1');

    const row3X = byStyle.get('3930R3X');
    expect(row3X).toBeDefined();
    expect(row3X?.ORDERED5).toBe('1');
  });

  it('does not expose XXL/XXXL unless 2X/3X rows exist in API payload', () => {
    const noExtendedRows: OrderItem[] = [
      {
        ORDER_NUM: 'SH2COC',
        DESIGN_NUM: 'D2',
        ITEM_ID: 'A',
        SHIRTNAME: 'Classic Tee',
        Expr1: 'Black',
        STYLE_NUM: '3930R',
        size2: 'SM',
        size3: 'MD',
        size4: 'LG',
        size5: 'XL',
        UNITPRICE: 10,
      },
    ];

    const model = buildApiOrderCategoryModel(noExtendedRows);
    const groupKey = Object.keys(model.productMap)[0];
    expect(groupKey).toBeTruthy();

    const groupedProduct = model.productMap[groupKey];
    const activeVariant = groupedProduct.defaultVariant || groupedProduct.variantOptions?.[0] || 'default';
    const sizes = groupedProduct.sizeOptionsByVariant?.[activeVariant] || groupedProduct.sizeLabels || [];

    expect(sizes).toEqual(['SM', 'MD', 'LG', 'XL']);
    expect(sizes).not.toContain('XXL');
    expect(sizes).not.toContain('XXXL');
    expect(sizes).not.toContain('2XL');
    expect(sizes).not.toContain('3XL');
  });

  it('groups shared M# into one card and keeps each base STYLE_NUM as its own tab variant', () => {
    const sharedMockupRows: OrderItem[] = [
      {
        ORDER_NUM: 'SH2COC',
        DESIGN_NUM: 'D3',
        ITEM_ID: 'A',
        SHIRTNAME: 'Short Sleeve Tee',
        Expr1: 'Black',
        STYLE_NUM: '3930R',
        COLOR_INIT: 'BLK',
        size2: 'SM',
        size3: 'MD',
        UNITPRICE: 10,
        'M#': 'M57704058',
      },
      {
        ORDER_NUM: 'SH2COC',
        DESIGN_NUM: 'D3',
        ITEM_ID: 'B',
        SHIRTNAME: 'Long Sleeve Tee',
        Expr1: 'Black',
        STYLE_NUM: '4930R',
        COLOR_INIT: 'BLK',
        size2: 'SM',
        size3: 'MD',
        UNITPRICE: 12,
        'M#': 'M57704058',
      },
      {
        ORDER_NUM: 'SH2COC',
        DESIGN_NUM: 'D3',
        ITEM_ID: 'C',
        SHIRTNAME: 'Hoodie',
        Expr1: 'Black',
        STYLE_NUM: '996G',
        COLOR_INIT: 'BLK',
        size2: 'SM',
        size3: 'MD',
        UNITPRICE: 18,
        'M#': 'M57704058',
      },
      {
        ORDER_NUM: 'SH2COC',
        DESIGN_NUM: 'D3',
        ITEM_ID: 'D',
        SHIRTNAME: 'Crew Sweatshirt',
        Expr1: 'Black',
        STYLE_NUM: '562MR',
        COLOR_INIT: 'BLK',
        size2: 'SM',
        size3: 'MD',
        UNITPRICE: 16,
        'M#': 'M57704058',
      },
    ];

    const model = buildApiOrderCategoryModel(sharedMockupRows);
    const productKeys = Object.keys(model.productMap);
    expect(productKeys).toHaveLength(1);

    const groupedProduct = model.productMap[productKeys[0]];
    expect(groupedProduct).toBeDefined();
    expect(groupedProduct.variantOptions).toEqual(['3930R', '4930R', '996G', '562MR']);

    const tabLabels = groupedProduct.variantDisplayNameByKey || {};
    expect(tabLabels['3930R']).toBeTruthy();
    expect(tabLabels['4930R']).toBeTruthy();
    expect(tabLabels['996G']).toBeTruthy();
    expect(tabLabels['562MR']).toBeTruthy();
  });

  it('keeps quantities scoped to the selected tab variant when ITEM_ID values are blank', () => {
    const sharedMockupRowsWithBlankItemIds: OrderItem[] = [
      {
        ORDER_NUM: '100324',
        DESIGN_NUM: 'SH2FDC',
        ITEM_ID: '            ',
        SHIRTNAME: 'ADULT SS COTTON TEE',
        Expr1: 'M90635085',
        STYLE_NUM: '3930R  ',
        COLOR_INIT: 'GLD',
        LIN: '9',
        size2: 'SM',
        size3: 'MD',
        size4: 'LG',
        size5: 'XL',
      },
      {
        ORDER_NUM: '100324',
        DESIGN_NUM: 'SH2FDC',
        ITEM_ID: '            ',
        SHIRTNAME: 'FRUIT L/S TEE',
        Expr1: 'M90635085',
        STYLE_NUM: '4930R  ',
        COLOR_INIT: 'GLD',
        LIN: '12',
        size2: 'SM',
        size3: 'MD',
        size4: 'LG',
        size5: 'XL',
      },
      {
        ORDER_NUM: '100324',
        DESIGN_NUM: 'SH2FDC',
        ITEM_ID: '            ',
        SHIRTNAME: 'JERZEE HOODED SWEAT',
        Expr1: 'M90635085',
        STYLE_NUM: '996MR  ',
        COLOR_INIT: 'GLD',
        LIN: '14',
        size2: 'SM',
        size3: 'MD',
        size4: 'LG',
        size5: 'XL',
      },
    ];

    const model = buildApiOrderCategoryModel(sharedMockupRowsWithBlankItemIds);
    const groupKey = Object.keys(model.productMap)[0];
    expect(groupKey).toBeTruthy();

    const payload = buildApiOrderPayload(
      {
        orderTemplateId: 'TEMPLATE-2',
        school: null,
        items: sharedMockupRowsWithBlankItemIds,
        fetchedAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
      } as ApiSchoolPageData,
      {
        [groupKey]: {
          activeVariant: '3930R',
          variantQuantities: {
            '3930R': {
              SM: 2,
              MD: 2,
              LG: 2,
              XL: 2,
            },
            '4930R': {
              SM: 0,
              MD: 0,
              LG: 0,
              XL: 0,
            },
            '996MR': {
              SM: 0,
              MD: 0,
              LG: 0,
              XL: 0,
            },
          },
        },
      },
      model.productMap,
      model.sourceToGroupKeyMap,
      {
        company: 'Store',
        storeNumber: '1',
        poNumber: '12345678',
        orderedBy: 'Manager',
        date: '2026-03-19',
        orderNotes: '',
      }
    );

    expect(payload).not.toBeNull();
    const items = payload?.items || [];
    const byStyle = new Map(items.map((item) => [String(item.STYLE_NUM || '').trim(), item]));

    const row3930 = byStyle.get('3930R');
    expect(row3930?.ORDERED2).toBe('2');
    expect(row3930?.ORDERED3).toBe('2');
    expect(row3930?.ORDERED4).toBe('2');
    expect(row3930?.ORDERED5).toBe('2');

    const row4930 = byStyle.get('4930R');
    expect(row4930?.ORDERED2).toBe('0');
    expect(row4930?.ORDERED3).toBe('0');
    expect(row4930?.ORDERED4).toBe('0');
    expect(row4930?.ORDERED5).toBe('0');

    const row996 = byStyle.get('996MR');
    expect(row996?.ORDERED2).toBe('0');
    expect(row996?.ORDERED3).toBe('0');
    expect(row996?.ORDERED4).toBe('0');
    expect(row996?.ORDERED5).toBe('0');
  });
});
