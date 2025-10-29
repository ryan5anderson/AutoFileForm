// Re-export specific utilities that are used externally
export { getSizeOptions, calculateTotalItems, validateFormData, validateQuantities, hasOrderProducts, calcTotals, getQuantityMultiples, getShirtVersionTotal } from './calculations';
export { getDisplayProductName, getProductName, getVersionDisplayName, getRackDisplayName, hasColorOptions, getColorOptions, getColorDisplayName } from './naming';
export { createTemplateParams } from './emailTemplate';

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