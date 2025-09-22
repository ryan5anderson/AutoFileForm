import michiganStateConfig from './colleges/michiganState.json';
import arizonaStateConfig from './colleges/arizonaState.json';
import { College } from '../types';

// Type assertion since JSON imports need explicit typing
const michiganState = michiganStateConfig as College;
const arizonaState = arizonaStateConfig as College;

export const colleges = {
  michiganstate: michiganState,
  arizonastate: arizonaState,
};

export type CollegeKey = keyof typeof colleges;
