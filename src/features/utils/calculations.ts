import { FormData, EmailCategory, ShirtVersion, SizeCounts, Size, Category } from '../../types';

/**
 * Find the category path for a given imagePath
 * @param imagePath - The image path of the product
 * @param categories - Array of categories
 * @returns The category path or empty string if not found
 */
const getCategoryPathForImage = (imagePath: string, categories?: Category[]): string => {
  if (!categories) {
    // eslint-disable-next-line no-console
    console.log(`DEBUG: getCategoryPathForImage - no categories provided for ${imagePath}`);
    return '';
  }

  // eslint-disable-next-line no-console
  console.log(`DEBUG: getCategoryPathForImage called with imagePath=${imagePath}, categories=${categories.length}`);

  // Handle image paths that might include category prefixes
  // e.g., "tshirt/women/M102074486_SDSORS_Jr_Socrates_DTF_on_Steel.png"
  // or just "M102074486_SDSORS_Jr_Socrates_DTF_on_Steel.png"
  let searchImagePath = imagePath;

  if (imagePath.includes('/')) {
    const parts = imagePath.split('/');
    if (parts.length >= 2) {
      const potentialCategory = parts[0];
      console.log(`DEBUG: Checking potential category: ${potentialCategory} for image: ${imagePath}`);

      // Check if this is a valid category path
      if (potentialCategory === 'tshirt/men' || potentialCategory === 'tshirt/women' ||
          potentialCategory === 'jacket' || potentialCategory === 'flannels' ||
          potentialCategory === 'pants' || potentialCategory === 'shorts' ||
          potentialCategory === 'hat' || potentialCategory === 'beanie' ||
          potentialCategory === 'socks' || potentialCategory === 'bottle' ||
          potentialCategory === 'sticker' || potentialCategory === 'plush' ||
          potentialCategory === 'signage' ||
          potentialCategory === 'displays') {
        console.log(`DEBUG: Found matching category path: ${potentialCategory}`);
        return potentialCategory;
      } else {
        console.log(`DEBUG: ${potentialCategory} is not a recognized category path`);
        // If the first part is not a category path, assume the whole thing is the filename
        searchImagePath = imagePath;
      }
    }
  }

  console.log(`DEBUG: Searching for image ${searchImagePath} in categories`);

  // Search through categories for the image
  for (const category of categories) {
    console.log(`DEBUG: Checking category: ${category.path}, images: ${category.images?.length || 0}`);
    if (category.images && category.images.includes(searchImagePath)) {
      console.log(`DEBUG: Found image in category: ${category.path}`);
      return category.path;
    }
  }

  // Fallback: try searching for just the filename part
  const filename = searchImagePath.split('/').pop() || searchImagePath;
  console.log(`DEBUG: Trying to find just filename: ${filename}`);

  for (const category of categories) {
    console.log(`DEBUG: Checking category: ${category.path} for filename ${filename}`);
    if (category.images && category.images.includes(filename)) {
      console.log(`DEBUG: Found filename in category: ${category.path}`);
      return category.path;
    }
  }

  console.log(`DEBUG: Image ${imagePath} not found in any category, returning empty string`);
  return '';
};

/**
 * Get the correct pack size for a category/version combination
 * @param categoryPath - The category path
 * @param version - The shirt version (for shirts)
 * @param productName - The product name for special cases
 * @returns The pack size for this category/version
 */
const getCorrectPackSize = (categoryPath: string, version?: string, productName?: string): number => {
  console.log(`DEBUG: getCorrectPackSize called with categoryPath=${categoryPath}, version=${version}, productName=${productName}`);

  // Normalize inputs
  const normalizedCategory = categoryPath.trim().toLowerCase();
  const normalizedVersion = version?.trim().toLowerCase();

  console.log(`DEBUG: Normalized category: '${normalizedCategory}', version: '${normalizedVersion}'`);

  // Handle special product types first
  if (productName) {
    const lowerName = productName.toLowerCase();
    if (lowerName.includes('applique')) {
      console.log(`DEBUG: Special product applique, returning 6`);
      return 6;
    }
    if (lowerName.includes('tie-dye') || lowerName.includes('tie dye')) {
      console.log(`DEBUG: Special product tie-dye, returning 8`);
      return 8;
    }
    if (lowerName.includes('fleece short')) {
      console.log(`DEBUG: Special product fleece short, returning 4`);
      return 4;
    }
    if (lowerName.includes('fleece zip') || lowerName.includes('fleece_zip')) {
      console.log(`DEBUG: Special product fleece zip, returning 6`);
      return 6;
    }
  }

  // Handle specific category/version combinations
  switch (normalizedCategory) {
    case 'tshirt/men':
      console.log(`DEBUG: tshirt/men with version ${normalizedVersion}, returning pack size`);
      if (normalizedVersion === 'tshirt' || normalizedVersion === 'longsleeve' || normalizedVersion === 'hoodie' || normalizedVersion === 'crewneck') {
        console.log(`DEBUG: tshirt/men ${normalizedVersion} allows any quantity, returning 6`);
        return 6; // allowsAny = true
      }
      console.log(`DEBUG: tshirt/men unknown version ${normalizedVersion}, returning default 6`);
      return 6; // default
    case 'tshirt/women':
      console.log(`DEBUG: tshirt/women, returning 4`);
      return 4;
    case 'jacket':
      return 6;
    case 'flannels':
      return 8;
    case 'pants':
      return 4;
    case 'shorts':
      return 4;
    case 'hat':
    case 'beanie':
      return 6;
    case 'socks':
      return 6;
    case 'bottle':
    case 'signage':
      return 1;
    case 'sticker':
    case 'plush':
      return 6;
    default:
      console.log(`DEBUG: Unknown categoryPath: ${normalizedCategory}, version: ${normalizedVersion}, returning default 7`);
      return 7; // fallback
  }
};

/**
 * Check if a category/version combination allows any quantity
 * @param categoryPath - The category path
 * @param version - The shirt version
 * @param productName - The product name for special cases
 * @returns true if any quantity is allowed
 */
const getAllowsAnyQuantity = (categoryPath: string, version?: string, productName?: string): boolean => {
  console.log(`DEBUG: getAllowsAnyQuantity called with categoryPath="${categoryPath}", version="${version}"`);

  // Normalize inputs
  const normalizedCategory = categoryPath.trim().toLowerCase();
  const normalizedVersion = version?.trim().toLowerCase();

  // Only T-Shirt (Unisex) tshirt and longsleeve allow any quantity
  if (normalizedCategory === 'tshirt/men' && (normalizedVersion === 'tshirt' || normalizedVersion === 'longsleeve' || normalizedVersion === 'hoodie' || normalizedVersion === 'crewneck')) {
    console.log(`DEBUG: T-Shirt (Unisex) ${normalizedVersion} allows any quantity`);
    return true;
  }

  // Also check for accessories that allow any quantity
  if (normalizedCategory === 'bottle' || normalizedCategory === 'signage') {
    console.log(`DEBUG: Accessory ${normalizedCategory} allows any quantity`);
    return true;
  }

  console.log(`DEBUG: ${normalizedCategory}/${normalizedVersion} does NOT allow any quantity`);
  return false;
};


interface ValidationResult {
  isValid: boolean;
  errorMessage: string | null;
  invalidProductPaths: string[];
}

/**
 * Check if the order form data contains any products (non-empty order)
 * @param formData - The form data to check
 * @returns true if the order contains at least one product, false otherwise
 */
export const hasOrderProducts = (formData: FormData): boolean => {
  return !!(
    // Check simple quantities
    (formData.quantities && Object.values(formData.quantities).some(q => parseInt(q) > 0)) ||

    // Check shirt size counts
    (formData.shirtSizeCounts && Object.values(formData.shirtSizeCounts).some(versionCounts =>
      versionCounts && Object.values(versionCounts).some(counts =>
        counts && Object.values(counts).some(count => count > 0)
      )
    )) ||

    // Check color options
    (formData.colorOptions && Object.values(formData.colorOptions).some(colorOption =>
      colorOption && Object.values(colorOption).some(q => parseInt(q) > 0)
    )) ||

    // Check shirt color size counts
    (formData.shirtColorSizeCounts && Object.values(formData.shirtColorSizeCounts).some(versionData =>
      versionData && Object.values(versionData).some(colorData =>
        colorData && Object.values(colorData).some(counts =>
          counts && Object.values(counts).some(count => count > 0)
        )
      )
    )) ||

    // Check pant options (sweatpants and joggers)
    (formData.pantOptions && Object.values(formData.pantOptions).some(pantOption =>
      pantOption && (
        (pantOption.sweatpants && Object.values(pantOption.sweatpants).some(counts =>
          counts && Object.values(counts).some(count => count > 0)
        )) ||
        (pantOption.joggers && Object.values(pantOption.joggers).some(counts =>
          counts && Object.values(counts).some(count => count > 0)
        ))
      )
    )) ||

    // Check sweatpant/jogger options
    (formData.sweatpantJoggerOptions && Object.values(formData.sweatpantJoggerOptions).some(option =>
      option && Object.values(option).some(value => value && parseInt(value) > 0)
    )) ||

    // Check display options
    (formData.displayOptions && Object.values(formData.displayOptions).some(displayOption =>
      displayOption && (parseInt(displayOption.displayOnly || '0') > 0 || parseInt(displayOption.displayStandardCasePack || '0') > 0)
    ))
  );
};

export const validateFormData = (formData: FormData, categories?: Category[]): ValidationResult => {
  // Check all required fields
  if (!formData.company.trim() || !formData.storeNumber.trim() || !formData.storeManager.trim() || !formData.date.trim()) {
    return {
      isValid: false,
      errorMessage: 'Please fill out all store information fields.',
      invalidProductPaths: []
    };
  }

  // Check if order is empty (no products selected)
  if (!hasOrderProducts(formData)) {
    return {
      isValid: false,
      errorMessage: 'Please select at least one product before submitting your order.',
      invalidProductPaths: []
    };
  }

  // Validate quantities against pack size requirements
  const quantityValidationResult = validateQuantities(formData, categories);
  if (!quantityValidationResult.isValid) {
    return quantityValidationResult;
  }

  return {
    isValid: true,
    errorMessage: null,
    invalidProductPaths: []
  };
};

/**
 * Validate all product quantities in the form data against pack size requirements
 * @param formData - The form data containing all product selections
 * @param categories - Array of categories to help identify product types
 * @returns ValidationResult with error details and list of invalid product paths
 */
export const validateQuantities = (formData: FormData, categories?: Category[]): ValidationResult => {
  const errors: string[] = [];
  const invalidProductPaths: string[] = [];

  // Validate simple quantities (for products like bottles, stickers, etc.)
  Object.entries(formData.quantities || {}).forEach(([imagePath, quantityStr]) => {
    const quantity = parseInt(quantityStr);
    if (quantity > 0) {
      const categoryPath = getCategoryPathForImage(imagePath, categories);
      const packSize = getCorrectPackSize(categoryPath, undefined, imagePath);
      const allowsAny = getAllowsAnyQuantity(categoryPath, undefined, imagePath);

      if (allowsAny) {
        // For categories that allow any quantity, only check minimum
        if (quantity < 1) {
          errors.push(`${imagePath}: Minimum quantity is 1`);
          invalidProductPaths.push(imagePath);
        }
      } else {
        // For categories that require pack size multiples
        if (quantity % packSize !== 0) {
          errors.push(`${imagePath}: Quantity must be a multiple of ${packSize}`);
          invalidProductPaths.push(imagePath);
        }
      }
    }
  });

  // Validate shirt size counts
  Object.entries(formData.shirtSizeCounts || {}).forEach(([imagePath, versionCounts]) => {
    if (versionCounts) {
      Object.entries(versionCounts).forEach(([version, counts]) => {
        if (counts) {
          const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
          if (total > 0) {
            const categoryPath = getCategoryPathForImage(imagePath, categories);
            const packSize = getCorrectPackSize(categoryPath, version, imagePath);
            const allowsAny = getAllowsAnyQuantity(categoryPath, version, imagePath);

            console.log(`VALIDATION: ${imagePath} (${version}): categoryPath=${categoryPath}, packSize=${packSize}, allowsAny=${allowsAny}, total=${total}`);

            if (allowsAny) {
              // For categories that allow any quantity, only check minimum
              if (total < 1) {
                errors.push(`${imagePath} (${version}): Minimum quantity is 1`);
                invalidProductPaths.push(imagePath);
              }
            } else {
              // For categories that require pack size multiples
              if (total % packSize !== 0) {
                errors.push(`${imagePath} (${version}): Total must be a multiple of ${packSize}`);
                invalidProductPaths.push(imagePath);
              }
            }
          }
        }
      });
    }
  });

  // Validate color options
  Object.entries(formData.colorOptions || {}).forEach(([imagePath, colorOption]) => {
    if (colorOption) {
      Object.entries(colorOption).forEach(([color, quantityStr]) => {
        const quantity = parseInt(quantityStr);
        if (quantity > 0) {
          const categoryPath = getCategoryPathForImage(imagePath, categories);
          const packSize = getCorrectPackSize(categoryPath, undefined, imagePath);
          const allowsAny = getAllowsAnyQuantity(categoryPath, undefined, imagePath);

          if (allowsAny) {
            if (quantity < 1) {
              errors.push(`${imagePath} (${color}): Minimum quantity is 1`);
              invalidProductPaths.push(imagePath);
            }
          } else {
            if (quantity % packSize !== 0) {
              errors.push(`${imagePath} (${color}): Quantity must be a multiple of ${packSize}`);
              invalidProductPaths.push(imagePath);
            }
          }
        }
      });
    }
  });

  // Validate shirt color size counts
  Object.entries(formData.shirtColorSizeCounts || {}).forEach(([imagePath, versionData]) => {
    if (versionData) {
      Object.entries(versionData).forEach(([version, colorData]) => {
        if (colorData) {
          Object.entries(colorData).forEach(([color, counts]) => {
            if (counts) {
              const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
              if (total > 0) {
                const categoryPath = getCategoryPathForImage(imagePath, categories);
                const packSize = getCorrectPackSize(categoryPath, version, imagePath);
                const allowsAny = getAllowsAnyQuantity(categoryPath, version, imagePath);

                if (allowsAny) {
                  if (total < 1) {
                    errors.push(`${imagePath} (${version}, ${color}): Minimum quantity is 1`);
                    invalidProductPaths.push(imagePath);
                  }
                } else {
                  if (total % packSize !== 0) {
                    errors.push(`${imagePath} (${version}, ${color}): Total must be a multiple of ${packSize}`);
                    invalidProductPaths.push(imagePath);
                  }
                }
              }
            }
          });
        }
      });
    }
  });

  // Validate pant options
  Object.entries(formData.pantOptions || {}).forEach(([imagePath, pantOption]) => {
    if (pantOption) {
      // Validate sweatpants
      if (pantOption.sweatpants) {
        Object.entries(pantOption.sweatpants).forEach(([color, counts]) => {
          if (counts) {
            const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
            if (total > 0) {
              const categoryPath = getCategoryPathForImage(imagePath, categories);
              const packSize = getCorrectPackSize(categoryPath, 'sweatpants', imagePath);
              const allowsAny = getAllowsAnyQuantity(categoryPath, 'sweatpants', imagePath);

              if (allowsAny) {
                if (total < 1) {
                  errors.push(`${imagePath} (Sweatpants ${color}): Minimum quantity is 1`);
                  invalidProductPaths.push(imagePath);
                }
              } else {
                if (total % packSize !== 0) {
                  errors.push(`${imagePath} (Sweatpants ${color}): Total must be a multiple of ${packSize}`);
                  invalidProductPaths.push(imagePath);
                }
              }
            }
          }
        });
      }

      // Validate joggers
      if (pantOption.joggers) {
        Object.entries(pantOption.joggers).forEach(([color, counts]) => {
          if (counts) {
            const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
            if (total > 0) {
              const categoryPath = getCategoryPathForImage(imagePath, categories);
              const packSize = getCorrectPackSize(categoryPath, 'joggers', imagePath);
              const allowsAny = getAllowsAnyQuantity(categoryPath, 'joggers', imagePath);

              if (allowsAny) {
                if (total < 1) {
                  errors.push(`${imagePath} (Joggers ${color}): Minimum quantity is 1`);
                  invalidProductPaths.push(imagePath);
                }
              } else {
                if (total % packSize !== 0) {
                  errors.push(`${imagePath} (Joggers ${color}): Total must be a multiple of ${packSize}`);
                  invalidProductPaths.push(imagePath);
                }
              }
            }
          }
        });
      }
    }
  });

  // Validate display options
  Object.entries(formData.displayOptions || {}).forEach(([imagePath, displayOption]) => {
    if (displayOption) {
      const displayOnly = parseInt(displayOption.displayOnly || '0');
      const displayStandard = parseInt(displayOption.displayStandardCasePack || '0');

      if (displayOnly > 0 || displayStandard > 0) {
        // Display options can be 1 or more, no pack size restrictions
        // But we should validate that at least one display option is selected if any quantity is specified
      }
    }
  });

  // Validate sweatpant/jogger options (dropdown selections)
  Object.entries(formData.sweatpantJoggerOptions || {}).forEach(([imagePath, option]) => {
    if (option) {
      Object.entries(option).forEach(([optionType, value]) => {
        if (value && value !== '') {
          const quantity = parseInt(value);
          if (quantity > 0) {
            const categoryPath = getCategoryPathForImage(imagePath, categories);
            const packSize = getCorrectPackSize(categoryPath, optionType.includes('sweatpant') ? 'sweatpants' : 'joggers', imagePath);
            const allowsAny = getAllowsAnyQuantity(categoryPath, optionType.includes('sweatpant') ? 'sweatpants' : 'joggers', imagePath);

            if (allowsAny) {
              if (quantity < 1) {
                errors.push(`${imagePath} (${optionType}): Minimum quantity is 1`);
                invalidProductPaths.push(imagePath);
              }
            } else {
              if (quantity % packSize !== 0) {
                errors.push(`${imagePath} (${optionType}): Quantity must be a multiple of ${packSize}`);
                invalidProductPaths.push(imagePath);
              }
            }
          }
        }
      });
    }
  });

  if (errors.length > 0) {
    // Remove duplicates from invalidProductPaths
    const uniquePaths: string[] = [];
    invalidProductPaths.forEach(path => {
      if (!uniquePaths.includes(path)) {
        uniquePaths.push(path);
      }
    });
    return {
      isValid: false,
      errorMessage: `Quantity validation errors:\n${errors.join('\n')}`,
      invalidProductPaths: uniquePaths
    };
  }

  return {
    isValid: true,
    errorMessage: null,
    invalidProductPaths: []
  };
};

export const calculateTotalUnits = (emailCategories: EmailCategory[]): number => {
  return emailCategories.reduce((sum: number, cat: EmailCategory) => 
    sum + cat.items.reduce((catSum: number, item: any) => 
      catSum + Number(item.qty), 0
    ), 0
  );
};

export const getShirtVersionTotal = (shirtVersions: ShirtVersion | undefined, availableVersions?: string[]): number => {
  if (!shirtVersions || !availableVersions) return 0;
  return availableVersions.reduce((sum, version) => {
    const versionValue = shirtVersions[version as keyof ShirtVersion];
    return sum + Number(versionValue || 0);
  }, 0);
};

type Totals = {
  total: number;
  packs: number;
  remainder: number;
  needed: number;
  isValid: boolean;
};

export function calcTotals(counts: SizeCounts, packSize: number = 7, allowAnyQuantity: boolean = false): Totals {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const isValid = total > 0 && (allowAnyQuantity || total % packSize === 0);
  return {
    total,
    packs: Math.floor(total / packSize),
    remainder: total % packSize,
    needed: allowAnyQuantity ? 0 : (packSize - (total % packSize)) % packSize,
    isValid,
  };
}

export function getQuantityMultiples(imageName: string, categoryName: string, categoryPath?: string, version?: string): number[] {
  // Import getPackSize here to avoid circular dependency issues
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getPackSize } = require('../../config/packSizes');

  // Get the pack size for this category/version
  const packSize = categoryPath ? getPackSize(categoryPath, version, imageName) : 7;

  // Generate quantity multiples based on pack size
  // Show up to 6 packs worth of quantities (e.g., for pack size 4: 4, 8, 12, 16, 20, 24)
  const multiples: number[] = [];
  for (let i = 1; i <= 6; i++) {
    multiples.push(packSize * i);
  }

  // Special handling for bottles (allow individual quantities)
  if (categoryName.toLowerCase().includes('bottle')) {
    return [1, 2, 3, 4, 5, 6];
  }

  // For all other categories, return multiples based on pack size
  return multiples;
}

export function getSizeOptions(categoryPath: string, version?: string): Size[] {
  // Socks use different sizing
  if (categoryPath.includes('sock')) {
    return ['SM', 'XL'] as any;
  }

  // T-shirts and hoodies get XXXL option (but not women's t-shirts)
  if ((version === 'tshirt' || version === 'hoodie') && !categoryPath.includes('women')) {
    return ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  }

  // Women's t-shirts get S-XXL
  if (version === 'tshirt' && categoryPath.includes('women')) {
    return ['S', 'M', 'L', 'XL', 'XXL'];
  }

  // Longsleeve and crewneck get S-XXL
  if (version === 'longsleeve' || version === 'crewneck') {
    return ['S', 'M', 'L', 'XL', 'XXL'];
  }

  // Jackets get S-XXL (check both version and category path)
  if (version === 'jacket' || categoryPath.includes('jacket')) {
    return ['S', 'M', 'L', 'XL', 'XXL'];
  }

  // Sweatpants and joggers get S-XL
  if (categoryPath === 'pants' || version === 'sweatpants' || version === 'joggers' || categoryPath.includes('sweatpant') || categoryPath.includes('jogger')) {
    return ['S', 'M', 'L', 'XL'];
  }

  // Shorts get S-XL
  if (version === 'shorts' || categoryPath.includes('short')) {
    return ['S', 'M', 'L', 'XL'];
  }

  // Flannels get S-XL
  if (version === 'flannels' || categoryPath.includes('flannel')) {
    return ['S', 'M', 'L', 'XL'];
  }

  // Default sizes for all other items (including women's t-shirts)
  return ['S', 'M', 'L', 'XL', 'XXL'];
}

/**
 * Calculate the total number of items from all quantity sources in form data
 * @param formData - The form data containing all product selections
 * @returns The total number of items across all products and quantity types
 */
export const calculateTotalItems = (formData: FormData): number => {
  let total = 0;

  // Count simple quantities (for products like bottles, stickers, etc.)
  Object.values(formData.quantities || {}).forEach(qty => {
    total += parseInt(qty) || 0;
  });

  // Count shirt size counts
  Object.values(formData.shirtSizeCounts || {}).forEach(versionCounts => {
    if (versionCounts) {
      Object.values(versionCounts).forEach(counts => {
        if (counts) {
          total += Object.values(counts).reduce((sum, count) => sum + count, 0);
        }
      });
    }
  });

  // Count color options
  Object.values(formData.colorOptions || {}).forEach(colorOption => {
    if (colorOption) {
      Object.values(colorOption).forEach(qty => {
        total += parseInt(qty) || 0;
      });
    }
  });

  // Count shirt color size counts
  Object.values(formData.shirtColorSizeCounts || {}).forEach(versionData => {
    if (versionData) {
      Object.values(versionData).forEach(colorData => {
        if (colorData) {
          Object.values(colorData).forEach(counts => {
            if (counts) {
              total += Object.values(counts).reduce((sum, count) => sum + count, 0);
            }
          });
        }
      });
    }
  });

  // Count pant options (sweatpants and joggers)
  Object.values(formData.pantOptions || {}).forEach(pantOption => {
    if (pantOption) {
      // Count sweatpants
      if (pantOption.sweatpants) {
        Object.values(pantOption.sweatpants).forEach(counts => {
          if (counts) {
            total += Object.values(counts).reduce((sum, count) => sum + count, 0);
          }
        });
      }
      // Count joggers
      if (pantOption.joggers) {
        Object.values(pantOption.joggers).forEach(counts => {
          if (counts) {
            total += Object.values(counts).reduce((sum, count) => sum + count, 0);
          }
        });
      }
    }
  });

  // Count sweatpant/jogger options (dropdown selections)
  Object.values(formData.sweatpantJoggerOptions || {}).forEach(option => {
    if (option) {
      Object.values(option).forEach(value => {
        total += parseInt(value) || 0;
      });
    }
  });

  // Count display options
  Object.values(formData.displayOptions || {}).forEach(displayOption => {
    if (displayOption) {
      total += parseInt(displayOption.displayOnly || '0') || 0;
      total += parseInt(displayOption.displayStandardCasePack || '0') || 0;
    }
  });

  return total;
};