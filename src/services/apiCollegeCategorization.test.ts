import { describe, expect, it } from '@jest/globals';

import {
  API_COLLEGE_CATEGORIES,
  categorizeApiCollegeProduct,
} from './apiCollegeCategorization';

const classify = (input: { SHIRT_NAME?: string; DESCRIPT?: string; DESIGN_NUM?: string; STYL_NUM?: string }) =>
  categorizeApiCollegeProduct({
    SHIRT_NAME: input.SHIRT_NAME || '',
    DESCRIPT: input.DESCRIPT || '',
    DESIGN_NUM: input.DESIGN_NUM || '',
    STYL_NUM: input.STYL_NUM || '',
  });

describe('categorizeApiCollegeProduct', () => {
  it('matches direct style overrides', () => {
    expect(classify({ STYL_NUM: 'SSBOT' })).toBe(API_COLLEGE_CATEGORIES.WATER_BOTTLES);
    expect(classify({ STYL_NUM: 'H20BTL2' })).toBe(API_COLLEGE_CATEGORIES.WATER_BOTTLES);
    expect(classify({ STYL_NUM: 'BEARSHI' })).toBe(API_COLLEGE_CATEGORIES.PLUSH);
    expect(classify({ STYL_NUM: 'BPBB' })).toBe(API_COLLEGE_CATEGORIES.PLUSH);
    expect(classify({ STYL_NUM: 'SPINSIG' })).toBe(API_COLLEGE_CATEGORIES.SIGNAGE);
    expect(classify({ STYL_NUM: 'PFDHEAD' })).toBe(API_COLLEGE_CATEGORIES.SIGNAGE);
    expect(classify({ STYL_NUM: 'S8052' })).toBe(API_COLLEGE_CATEGORIES.SOCKS);
    expect(classify({ STYL_NUM: 'SP08' })).toBe(API_COLLEGE_CATEGORIES.KNIT_CAPS_BEANIE);
    expect(classify({ STYL_NUM: '4753' })).toBe(API_COLLEGE_CATEGORIES.KNIT_CAPS_BEANIE);
    expect(classify({ STYL_NUM: 'VC300' })).toBe(API_COLLEGE_CATEGORIES.CAPS_HAT);
    expect(classify({ STYL_NUM: '5617' })).toBe(API_COLLEGE_CATEGORIES.JACKETS);
    expect(classify({ STYL_NUM: 'F15' })).toBe(API_COLLEGE_CATEGORIES.FLANNELS);
    expect(classify({ STYL_NUM: 'F15P' })).toBe(API_COLLEGE_CATEGORIES.FLANNELS);
    expect(classify({ STYL_NUM: '4890P' })).toBe(API_COLLEGE_CATEGORIES.SHORTS);
    expect(classify({ STYL_NUM: '560WVR' })).toBe(API_COLLEGE_CATEGORIES.LADIES_TOPS);
    expect(classify({ STYL_NUM: 'IC47WR' })).toBe(API_COLLEGE_CATEGORIES.LADIES_TOPS);
    expect(classify({ STYL_NUM: '88MR' })).toBe(API_COLLEGE_CATEGORIES.LADIES_TOPS);
    expect(classify({ STYL_NUM: '240MS' })).toBe(API_COLLEGE_CATEGORIES.UNISEX_TSHIRT);
    expect(classify({ STYL_NUM: '240MS2X' })).toBe(API_COLLEGE_CATEGORIES.UNISEX_TSHIRT);
  });

  it('matches prefix style overrides', () => {
    expect(classify({ STYL_NUM: 'BEAR123' })).toBe(API_COLLEGE_CATEGORIES.PLUSH);
    expect(classify({ STYL_NUM: '974MP' })).toBe(API_COLLEGE_CATEGORIES.PANTS);
    expect(classify({ STYL_NUM: '974MPP' })).toBe(API_COLLEGE_CATEGORIES.PANTS);
    expect(classify({ STYL_NUM: '975MPR' })).toBe(API_COLLEGE_CATEGORIES.PANTS);
    expect(classify({ STYL_NUM: '88MRSDLOCS' })).toBe(API_COLLEGE_CATEGORIES.LADIES_TOPS);
    expect(classify({ STYL_NUM: '996ESHCMDW' })).toBe(API_COLLEGE_CATEGORIES.UNISEX_TSHIRT);
  });

  it('matches keyword-only rule groups', () => {
    expect(classify({ SHIRT_NAME: 'Rollup knit beanie' })).toBe(API_COLLEGE_CATEGORIES.KNIT_CAPS_BEANIE);
    expect(classify({ SHIRT_NAME: 'Wash cap' })).toBe(API_COLLEGE_CATEGORIES.CAPS_HAT);
    expect(classify({ DESCRIPT: 'Flannel pajama pant' })).toBe(API_COLLEGE_CATEGORIES.FLANNELS);
    expect(classify({ DESCRIPT: 'Crew 8 sock set' })).toBe(API_COLLEGE_CATEGORIES.SOCKS);
    expect(classify({ DESCRIPT: 'Vinyl decal pack' })).toBe(API_COLLEGE_CATEGORIES.STICKERS);
    expect(classify({ SHIRT_NAME: 'Bookbag' })).toBe(API_COLLEGE_CATEGORIES.BACKPACK);
    expect(classify({ DESCRIPT: 'Youth onesie' })).toBe(API_COLLEGE_CATEGORIES.YOUTH_INFANT);
    expect(classify({ DESCRIPT: 'MSU MOM TEE' })).toBe(API_COLLEGE_CATEGORIES.LADIES_TOPS);
    expect(classify({ DESCRIPT: 'GO GREEN GIRL SHIRT' })).toBe(API_COLLEGE_CATEGORIES.LADIES_TOPS);
    expect(classify({ DESIGN_NUM: 'SDFAMS' })).toBe(API_COLLEGE_CATEGORIES.LADIES_TOPS);
    expect(classify({ SHIRT_NAME: 'Tri-blend tee' })).toBe(API_COLLEGE_CATEGORIES.UNISEX_TSHIRT);
  });

  it('honors precedence collisions', () => {
    expect(classify({ SHIRT_NAME: 'Water Bottle Hoodie', DESCRIPT: 'Hooded sweat' }))
      .toBe(API_COLLEGE_CATEGORIES.WATER_BOTTLES);
    expect(classify({ SHIRT_NAME: 'Knit cap hat' }))
      .toBe(API_COLLEGE_CATEGORIES.KNIT_CAPS_BEANIE);
    expect(classify({ SHIRT_NAME: 'Flannel pants' }))
      .toBe(API_COLLEGE_CATEGORIES.FLANNELS);
    expect(classify({ SHIRT_NAME: 'Ladies tee crew' }))
      .toBe(API_COLLEGE_CATEGORIES.LADIES_TOPS);
    expect(classify({ SHIRT_NAME: 'Sticker tee' }))
      .toBe(API_COLLEGE_CATEGORIES.STICKERS);
    expect(classify({ SHIRT_NAME: 'Fleece shorts pants' }))
      .toBe(API_COLLEGE_CATEGORIES.SHORTS);
  });

  it('avoids weak backpack false positives', () => {
    expect(classify({ SHIRT_NAME: 'Hoodie', DESCRIPT: 'Case pack size' }))
      .toBe(API_COLLEGE_CATEGORIES.UNISEX_TSHIRT);
    expect(classify({ SHIRT_NAME: 'Pack hoodie' }))
      .toBe(API_COLLEGE_CATEGORIES.BACKPACK);
  });

  it('returns Unclassified when no rule matches', () => {
    expect(classify({ SHIRT_NAME: 'Ceramic mug', DESCRIPT: '12 oz collectible', STYL_NUM: 'MUG1' }))
      .toBe(API_COLLEGE_CATEGORIES.UNCLASSIFIED);
  });

  it('normalizes punctuation, spacing, and casing before matching', () => {
    expect(classify({ SHIRT_NAME: '  ladies---tee  ', DESCRIPT: '  cotton  ' }))
      .toBe(API_COLLEGE_CATEGORIES.LADIES_TOPS);
    expect(classify({ DESCRIPT: 'WaterBottle!!', STYL_NUM: ' h20btl ' }))
      .toBe(API_COLLEGE_CATEGORIES.WATER_BOTTLES);
  });
});
