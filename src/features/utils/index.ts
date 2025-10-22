// Re-export all utilities for convenience
export * from './calculations';
export * from './imagePath';
export * from './naming';
export * from './emailTemplate';
export { getSizeOptions } from './calculations';
export { getDisplayProductName } from './naming';

// Utility function to filter shirt versions for applique and tiedye products
export const getFilteredShirtVersions = (imageName: string, versions: string[], tieDyeImages?: string[]): string[] => {
  const isApplique = imageName.toLowerCase().includes('applique');
  const isTiedye = tieDyeImages?.includes(imageName) || false;
  
  if (isApplique) {
    // Applique products only have crewneck and hoodie
    return versions.filter(version => version === 'crewneck' || version === 'hoodie');
  }
  
  if (isTiedye) {
    // Tiedye products cannot have crew neck
    return versions.filter(version => version !== 'crewneck');
  }
  
  return versions;
};