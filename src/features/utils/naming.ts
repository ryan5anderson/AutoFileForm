export const getProductName = (imageName: string): string => {
  const baseName = imageName.replace(/\.(png|jpg)$/, '');

  // Custom display names for specific sweatpant items
  const sweatpantDisplayMapping: Record<string, string> = {
    'M100447223 SHVSCD Value DTF Gray Pants Jogger.png': 'M100447223 SHVSCD Value DTF Gray Pants',
    'M100446293 SHPSDS Shake it DTF Gray Pants Jogger.png': 'M100446293 SHPSDS Shake it DTF Gray Pants',
    'M100448649 SHFDDS Force Down DTF Gray Pants Straight-Leg.png': 'M100448649 SHFDDS Force Down DTF Gray Pants',
  };

  if (sweatpantDisplayMapping[imageName]) return sweatpantDisplayMapping[imageName];

  return baseName;
};

// Get display name for user-facing pages (removes product ID and codes)
// Example: "M102073197_SDCAVC_Cavalier_DTF_on_Maroon" -> "Cavalier DTF on Maroon"
export const getDisplayProductName = (imageName: string): string => {
  const baseName = imageName.replace(/\.(png|jpg)$/, '');

  // Custom display names for specific sweatpant items (with ID/codes removed)
  const sweatpantDisplayMapping: Record<string, string> = {
    'M100447223 SHVSCD Value DTF Gray Pants Jogger.png': 'Value DTF Gray Pants',
    'M100446293 SHPSDS Shake it DTF Gray Pants Jogger.png': 'Shake it DTF Gray Pants',
    'M100448649 SHFDDS Force Down DTF Gray Pants Straight-Leg.png': 'Force Down DTF Gray Pants',
  };

  if (sweatpantDisplayMapping[imageName]) return sweatpantDisplayMapping[imageName];

  // Step 1: Find the second underscore and remove everything before it (including the second underscore)
  const firstUnderscoreIndex = baseName.indexOf('_');
  if (firstUnderscoreIndex !== -1) {
    const secondUnderscoreIndex = baseName.indexOf('_', firstUnderscoreIndex + 1);
    if (secondUnderscoreIndex !== -1) {
      // Remove everything up to and including the second underscore
      const afterSecondUnderscore = baseName.substring(secondUnderscoreIndex + 1);
      // Step 2: Replace remaining underscores with spaces
      const cleanedName = afterSecondUnderscore.replace(/_/g, ' ').trim();
      return cleanedName || baseName;
    }
  }

  // Fallback: just replace underscores with spaces if pattern doesn't match
  return baseName.replace(/_/g, ' ').trim();
};

export const getRackDisplayName = (imageName: string): string => {
  // Map rack image names to display names
  const rackDisplayMapping: Record<string, string> = {
    'Michigan_State_University_3FT_Inline_500px.jpg': 'Michigan State University Inline Display',
    'Michigan_state_University_Premium Floor Display 2.0_500px.jpg': 'Michigan State University Premium Floor Display',
    'Michigan_State_University_Tier2_Display_Floor_500px.jpg': 'Michigan State University Floor Display'
  };
  
  // If we have a custom mapping, use it
  if (rackDisplayMapping[imageName]) {
    return rackDisplayMapping[imageName];
  }
  
  // Otherwise, just replace underscores with spaces
  const baseName = imageName.replace(/\.(png|jpg)$/, '');
  return baseName.replace(/_/g, ' ').trim();
};

export const getVersionDisplayName = (version: string, imageName?: string): string => {
  let display = '';
  switch (version) {
    case 'tshirt': display = 'T-Shirt'; break;
    case 'longsleeve': display = 'Long Sleeve T-shirt'; break;
    case 'hoodie': display = 'Hoodie'; break;
    case 'crewneck': display = 'Crew Sweatshirt'; break;
    default: display = version;
  }
  return display;
};

// Check if a product has multiple color options
export const hasColorOptions = (imageName: string): boolean => {
  return imageName.includes('_or_');
};

// Extract color options from filename
// e.g., "Custom_DTF_on_White_or_Steel.png" -> ["White", "Steel"]
// e.g., "Custom_Logo_on_White_or_Gray.png" -> ["White", "Gray"]
export const getColorOptions = (imageName: string): string[] => {
  if (!hasColorOptions(imageName)) return [];
  
  // Match pattern: "on_Color1_or_Color2"
  const match = imageName.match(/on_(\w+)_or_(\w+)/i);
  if (match) {
    return [match[1], match[2]];
  }
  
  return [];
};

// Get display name for a color
export const getColorDisplayName = (color: string): string => {
  // Capitalize first letter
  return color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
};