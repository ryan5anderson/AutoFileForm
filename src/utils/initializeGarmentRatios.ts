import garmentRatiosData from '../config/garment_ratios_final.json';
import { firebaseGarmentRatioService, GarmentRatio } from '../services/firebaseGarmentRatioService';

/**
 * Initialize Firebase with default garment ratios from JSON file
 * This should be run once to seed the database
 */
export async function initializeDefaultGarmentRatios(): Promise<void> {
  try {
    await firebaseGarmentRatioService.initializeDefaultRatios(
      garmentRatiosData as GarmentRatio[]
    );
    console.log('✅ Default garment ratios initialized successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Error initializing default garment ratios:', error);
    throw error;
  }
}

