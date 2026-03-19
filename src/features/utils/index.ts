// Re-export specific utilities that are used externally
export { getSizeOptions, calculateTotalItems, validateFormData, validateQuantities, validateStoreInfo, hasOrderProducts, calcTotals, getQuantityMultiples, getShirtVersionTotal } from './calculations';
export { getDisplayProductName, getProductName, getVersionDisplayName, getRackDisplayName, hasColorOptions, getColorOptions, getColorDisplayName } from './naming';
export { createTemplateParams, createApiTemplateParams, buildApiReceiptCategories } from './emailTemplate';

// Utility function to filter shirt versions for applique and tiedye products
export const getFilteredShirtVersions = (imageName: string, versions: string[], tieDyeImages?: string[], crewOnlyImages?: string[], hoodOnlyImages?: string[]): string[] => {
  const isApplique = imageName.toLowerCase().includes('applique');
  const isTiedye = tieDyeImages?.includes(imageName) || false;
  const isHoodieOnly = hoodOnlyImages?.includes(imageName) || imageName.toLowerCase().includes('hood') || imageName.includes('CM7031');
  const isCrewOnly = crewOnlyImages?.includes(imageName) || false;
  
  if (isCrewOnly) {
    // Crew-only products only have crewneck
    return versions.filter(version => version === 'crewneck');
  }
  
  // Check hoodOnlyImages BEFORE applique - hood-only takes precedence
  if (isHoodieOnly) {
    // Hoodie-only products only have hoodie
    return versions.filter(version => version === 'hoodie');
  }
  
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