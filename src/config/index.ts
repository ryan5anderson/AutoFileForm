import michiganStateConfig from './colleges/michiganState.json';
import arizonaStateConfig from './colleges/arizonaState.json';
import westVirginiaUniversityConfig from './colleges/westVirginiaUniversity.json';
import pittsburghUniversityConfig from './colleges/pittsburghuniversity.json';
import { College } from '../types';

// Type assertion since JSON imports need explicit typing
const michiganState = michiganStateConfig as College;
const arizonaState = arizonaStateConfig as College;
const westVirginiaUniversity = westVirginiaUniversityConfig as College;
const pittsburghUniversity = pittsburghUniversityConfig as College;

export const colleges = {
  michiganstate: michiganState,
  arizonastate: arizonaState,
  westvirginiauniversity: westVirginiaUniversity,
  pittsburghuniversity: pittsburghUniversity,
};

export type CollegeKey = keyof typeof colleges;
