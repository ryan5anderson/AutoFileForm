// Re-export all utilities for convenience
export * from './calculations';
export * from './naming';
export * from './emailTemplate';
export { getSizeOptions, calculateTotalItems } from './calculations';
export { getDisplayProductName } from './naming';

// Utility function to filter shirt versions for applique and tiedye products
export const getFilteredShirtVersions = (imageName: string, versions: string[], tieDyeImages?: string[]): string[] => {
  const isApplique = imageName.toLowerCase().includes('applique');
  const isTiedye = tieDyeImages?.includes(imageName) || false;
  const isHoodieOnly = imageName.toLowerCase().includes('hood') || imageName.includes('CM7031');
  
  if (isApplique) {
    // Applique products only have crewneck and hoodie
    return versions.filter(version => version === 'crewneck' || version === 'hoodie');
  }
  
  if (isTiedye) {
    // Tiedye products cannot have crew neck
    return versions.filter(version => version !== 'crewneck');
  }
  
  if (isHoodieOnly) {
    // Hoodie-only products only have hoodie
    return versions.filter(version => version === 'hoodie');
  }
  
  return versions;
};