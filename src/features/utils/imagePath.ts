import { Category } from '../../types';

export const getAllImagePaths = (categories: Category[]): string[] => {
  return categories.flatMap(cat => cat.images.map((img: string) => `${cat.path}/${img}`));
};

export const getImagePath = (categoryPath: string, imageName: string): string => {
  return `${categoryPath}/${imageName}`;
};

// Mapping of rack images to their corresponding card items
export const getRackToCardMapping = (): Record<string, { sku: string; name: string }> => {
  return {
    'rack/Michigan_State_University_3FT_Inline_500px.jpg': {
      sku: 'MAGNET_BANNER',
      name: 'Magnet Banner card'
    },
    'rack/Michigan_state_University_Premium Floor Display 2.0_500px.jpg': {
      sku: 'M100516676',
      name: 'M100516676 SHWGCH PFD Header Card'
    },
    'rack/Michigan_State_University_Tier2_Display_Floor_500px.jpg': {
      sku: 'M100516533',
      name: 'M100516533 SHWGCS Spinner Header Card'
    }
  };
};
