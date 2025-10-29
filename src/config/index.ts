import { College } from '../types';

import alabamaUniversityConfig from './colleges/alabamauniversity.json';
import arizonaStateConfig from './colleges/arizonaState.json';
import michiganStateConfig from './colleges/michiganState.json';
import oregonUniversityConfig from './colleges/oregonUniversity.json';
import pittsburghUniversityConfig from './colleges/pittsburghuniversity.json';
import westVirginiaUniversityConfig from './colleges/westVirginiaUniversity.json';


// Type assertion since JSON imports need explicit typing
const michiganState = michiganStateConfig as College;
const arizonaState = arizonaStateConfig as College;
const oregonUniversity = oregonUniversityConfig as College;
const westVirginiaUniversity = westVirginiaUniversityConfig as College;
const pittsburghUniversity = pittsburghUniversityConfig as College;
const alabamaUniversity = alabamaUniversityConfig as College;

export const colleges = {
  michiganstate: michiganState,
  arizonastate: arizonaState,
  oregonuniversity: oregonUniversity,
  westvirginiauniversity: westVirginiaUniversity,
  pittsburghuniversity: pittsburghUniversity,
  alabamauniversity: alabamaUniversity,
};

// CollegeKey type removed - no external usage found
