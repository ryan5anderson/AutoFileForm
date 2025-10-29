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
  // Standard pattern: "on_Color1_or_Color2" or "on_Color1_or_Color2_or_Color3"
  if (imageName.includes('_or_')) return true;
  
  // Special case for WVU hat: "WhiteGrayor_Navy" pattern
  if (imageName.includes('WhiteGrayor_')) return true;
  
  return false;
};

// Extract color options from filename
// e.g., "Custom_DTF_on_White_or_Steel.png" -> ["White", "Steel"]
// e.g., "Custom_Logo_on_White_or_Gray.png" -> ["White", "Gray"]
// e.g., "Custom_Hat_on_White_or_Gray_or_Navy.png" -> ["White", "Gray", "Navy"]
// e.g., "Scrap_WhiteGrayor_Navy_Hat.png" -> ["White", "Gray", "Navy"] (special case)
export const getColorOptions = (imageName: string): string[] => {
  if (!hasColorOptions(imageName)) return [];
  
  // Special case: Handle "WhiteGrayor_Navy" pattern (for WVU hat)
  // Extract Navy before _Hat to avoid capturing "Hat" as a color
  const whiteGrayNavyMatch = imageName.match(/WhiteGrayor_([^_]+)(?:_Hat)?\./i);
  if (whiteGrayNavyMatch) {
    const navyColor = whiteGrayNavyMatch[1];
    return ['White', 'Gray', navyColor];
  }
  
  // First try to match pattern with three colors: "on_Color1_or_Color2_or_Color3"
  // Match colors but stop before _Hat, _Hat.png, etc. to avoid capturing "Hat" as a color
  const threeColorMatch = imageName.match(/on_(\w+)_or_(\w+)_or_(\w+)(?:_(?:Hat|Beanie))?\./i);
  if (threeColorMatch) {
    return [threeColorMatch[1], threeColorMatch[2], threeColorMatch[3]];
  }
  
  // Then try to match pattern with two colors: "on_Color1_or_Color2"
  const twoColorMatch = imageName.match(/on_(\w+)_or_(\w+)(?:_(?:Hat|Beanie))?\./i);
  if (twoColorMatch) {
    return [twoColorMatch[1], twoColorMatch[2]];
  }
  
  return [];
};

// Get display name for a color
export const getColorDisplayName = (color: string): string => {
  // Capitalize first letter
  return color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
};