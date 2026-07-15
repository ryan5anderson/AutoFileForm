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
    'M100447223 SHVSCD Value DTF Gray Pants Jogger.png': 'Value DTF Pants',
    'M100446293 SHPSDS Shake it DTF Gray Pants Jogger.png': 'Shake it DTF Pants',
    'M100448649 SHFDDS Force Down DTF Gray Pants Straight-Leg.png': 'Force Down DTF Pants',
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
      return removeColorFromPantsTitle(cleanedName || baseName);
    }
  }

  // Fallback: just replace underscores with spaces if pattern doesn't match
  const fallbackName = baseName.replace(/_/g, ' ').trim();
  return removeColorFromPantsTitle(fallbackName);
};

// Remove color words from sweatpants/joggers titles
// Example: "Value DTF Gray Pants" -> "Value DTF Pants"
// Example: "Custom DTF Steel Joggers" -> "Custom DTF Joggers"
function removeColorFromPantsTitle(name: string): string {
  // List of common color words to remove (order matters: multi-word colors first)
  const colors = [
    'Dark Navy', 'Dark Heather', 'Steel White', 'Crimson Black', 'Kelly Green',
    'Gray', 'Grey', 'Steel', 'Navy', 'Black', 'White', 'Maroon', 'Crimson',
    'Gold', 'Green', 'Forest', 'Royal', 'Charcoal', 'Ash', 'Heather'
  ];
  
  // Check if the name ends with "Pants", "Jogger", or "Joggers" (case-insensitive)
  const pantsMatch = name.match(/\s+(Pants|Jogger|Joggers)$/i);
  if (!pantsMatch) {
    return name; // Not a pants/jogger product, return as is
  }
  
  const pantsSuffix = pantsMatch[1]; // "Pants", "Jogger", or "Joggers"
  
  // Try to match and remove color words (case-insensitive)
  // Match colors that are followed by the pants/jogger suffix
  for (const color of colors) {
    // Escape special regex characters in the color name
    const escapedColor = color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // For multi-word colors, replace spaces with \s+ to match one or more spaces
    const colorPattern = escapedColor.replace(/\s+/g, '\\s+');
    // Create regex pattern: word boundary at start, color pattern, one or more spaces, then pants suffix
    const colorRegex = new RegExp(`\\b${colorPattern}\\s+(?=${pantsSuffix})`, 'i');
    if (colorRegex.test(name)) {
      // Remove the color word and return
      return name.replace(colorRegex, '').trim();
    }
  }
  
  return name; // No color found, return as is
}

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

// Explicit color/style options for hats whose filenames can't be parsed
// with the standard "on_Color1_or_Color2" pattern.
// Keyed by exact image filename.
const explicitColorOptions: Record<string, string[]> = {
  // Michigan State
  'M100489153_SHE1CH_Custom_Hat_on_White_or_Grays.png': ['White', 'Gray'],
  'M206228277_SEVISO_Custom_Forest_or_Black_Visor.png': ['Forest', 'Black'],
  'M206228371_SEVISO_Custom_Gray_or_White_Visor.png': ['Gray', 'White'],
  // Arizona State
  'M102300177_SHE1CH_Custom_Maroon_6235_or_6606.png': ['6235', '6606'],
  'M102300329_SHE1CH_Gray_FlyGold_White_-_no_mesh.png': ['Gray Fly', 'Gold', 'White'],
  'M102542014_SHE2CH_GrayGoldWhite_PE102-no_mesh.png': ['Gray', 'Gold', 'White'],
  'M204457186_SHE2CH_Pitch_WhtPE102Gry_Fly-no_mesh.png': ['White', 'Gray'],
  'M204457349_SHE2CH_Custom_AS_Gray_FlyWhite_Hat.png': ['Gray', 'White'],
  'M204458312_SHE1CH_Gold_Pfork-No_mesh_or_gold_hat.png': ['No Mesh', 'Gold'],
  // Alabama
  'M100120547_SHE1CH_Custom_on_GrayWhite_Hat.png': ['Gray', 'White'],
  'M100120777_SHE1CH_Custom_on_GrayWhite_Hat.png': ['Gray', 'White'],
  // Indiana
  'M206217389_SHE1CH_Athletic_Mark_Gray_or_White_Hat.png': ['Gray', 'White'],
  'M101362966_SHE1CB_Custom_Gray_or_White_Beanie.png': ['Gray', 'White'],
  'M101363128_SHE1CB_Custom_Gray_or_White_Beanie.png': ['Gray', 'White'],
};

// Check if a product has multiple color options
export const hasColorOptions = (imageName: string): boolean => {
  // Explicitly mapped products (hats with irregular filenames)
  if (explicitColorOptions[imageName]) return true;

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
  
  // Explicitly mapped products take priority over filename parsing
  if (explicitColorOptions[imageName]) {
    return explicitColorOptions[imageName];
  }
  
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
  // Capitalize each word (supports multi-word options like "Gray Fly" or "No Mesh")
  return color
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};