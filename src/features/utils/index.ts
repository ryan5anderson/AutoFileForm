// Re-export all utilities for convenience
export * from './calculations';
export * from './imagePath';
export * from './naming';
export * from './emailTemplate';
export { getSizeOptions } from './calculations';

// Utility function to filter shirt versions for applique products
export const getFilteredShirtVersions = (imageName: string, versions: string[]): string[] => {
  const isApplique = imageName.toLowerCase().includes('applique');
  if (!isApplique) return versions;
  return versions.filter(version => version === 'crewneck' || version === 'hoodie');
};