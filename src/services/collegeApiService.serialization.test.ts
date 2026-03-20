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
        storeManager: 'Manager',
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
        storeManager: 'Manager',
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
});
