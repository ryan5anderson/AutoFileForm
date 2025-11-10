import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';

import { db } from '../config/firebase';
import garmentRatiosData from '../config/garment_ratios_final.json';

export interface GarmentRatio {
  Name: string;
  "Set Pack": number | null;
  XS?: number | string;
  Small?: number | string;
  Medium?: number | string;
  Large?: number | string;
  XL?: number | string;
  "2X"?: number | string;
  "3X"?: number | string;
  "Size Scale": string;
  "6M"?: number;
  "12M"?: number;
  Sizes?: {
    SM?: number;
    LXL?: number;
  };
}

class FirebaseGarmentRatioService {
  private readonly COLLECTION_NAME = 'garmentRatios';
  private readonly DEFAULT_DOC_ID = 'default';

  /**
   * Get garment ratios for a specific college, or default if not found
   */
  async getGarmentRatios(collegeKey?: string): Promise<GarmentRatio[]> {
    try {
      const docId = collegeKey ? collegeKey : this.DEFAULT_DOC_ID;
      const docRef = doc(db, this.COLLECTION_NAME, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.ratios || [];
      }

      // If college-specific not found, return default
      if (collegeKey) {
        return this.getGarmentRatios(); // Recursively get default
      }

      // If default doesn't exist, try to initialize it
      // This will only happen once on first access
      try {
        const defaultRatios = garmentRatiosData as GarmentRatio[];
        await this.initializeDefaultRatios(defaultRatios);
        return defaultRatios;
      } catch (initError) {
        console.warn('Could not auto-initialize default ratios:', initError);
        return [];
      }
    } catch (error) {
      console.error('Error getting garment ratios:', error);
      return [];
    }
  }

  /**
   * Get a specific garment ratio by name for a college
   */
  async getGarmentRatioByName(
    garmentName: string, 
    collegeKey?: string
  ): Promise<GarmentRatio | null> {
    const ratios = await this.getGarmentRatios(collegeKey);
    return ratios.find(r => r.Name.toLowerCase() === garmentName.toLowerCase()) || null;
  }

  /**
   * Update a specific garment ratio for a college
   * This will create a college-specific override
   */
  async updateGarmentRatio(
    garmentName: string,
    updates: Partial<GarmentRatio>,
    collegeKey: string
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, collegeKey);
      const docSnap = await getDoc(docRef);

      let ratios: GarmentRatio[] = [];

      if (docSnap.exists()) {
        ratios = docSnap.data().ratios || [];
      } else {
        // If college-specific doc doesn't exist, start with default ratios
        const defaultRatios = await this.getGarmentRatios();
        ratios = [...defaultRatios];
      }

      // Find and update the ratio
      const index = ratios.findIndex(r => r.Name.toLowerCase() === garmentName.toLowerCase());
      
      if (index >= 0) {
        // Update existing ratio
        ratios[index] = { ...ratios[index], ...updates };
      } else {
        // Add new ratio (shouldn't happen, but handle it)
        ratios.push({ Name: garmentName, ...updates } as GarmentRatio);
      }

      // Save back to Firebase
      await setDoc(docRef, { 
        ratios,
        updatedAt: new Date().toISOString(),
        collegeKey 
      }, { merge: true });
    } catch (error) {
      console.error('Error updating garment ratio:', error);
      throw error;
    }
  }

  /**
   * Delete a college-specific override for a garment ratio
   * This will revert it back to the default ratio
   */
  async deleteGarmentRatioOverride(
    garmentName: string,
    collegeKey: string
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, collegeKey);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // No override exists, nothing to delete
        return;
      }

      let ratios: GarmentRatio[] = docSnap.data().ratios || [];
      
      // Remove the ratio from the college-specific overrides
      ratios = ratios.filter(r => r.Name.toLowerCase() !== garmentName.toLowerCase());

      if (ratios.length === 0) {
        // If no ratios left, delete the entire document
        await deleteDoc(docRef);
      } else {
        // Update the document with remaining ratios
        await setDoc(docRef, { 
          ratios,
          updatedAt: new Date().toISOString(),
          collegeKey 
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error deleting garment ratio override:', error);
      throw error;
    }
  }

  /**
   * Initialize default ratios from JSON data
   * This should be run once to seed the database
   */
  async initializeDefaultRatios(defaultRatios: GarmentRatio[]): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, this.DEFAULT_DOC_ID);
      const docSnap = await getDoc(docRef);

      // Only initialize if default doesn't exist
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          ratios: defaultRatios,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        console.log('Default garment ratios initialized in Firebase');
      }
    } catch (error) {
      console.error('Error initializing default ratios:', error);
      throw error;
    }
  }

  /**
   * Get all colleges that have custom ratios
   */
  async getCollegesWithCustomRatios(): Promise<string[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('collegeKey', '!=', null)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map(doc => doc.data().collegeKey)
        .filter(Boolean) as string[];
    } catch (error) {
      console.error('Error getting colleges with custom ratios:', error);
      return [];
    }
  }
}

export const firebaseGarmentRatioService = new FirebaseGarmentRatioService();

