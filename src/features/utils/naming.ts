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

export const getRackDisplayName = (imageName: string): string => {
  // Map rack image names to display names
  const rackDisplayMapping: Record<string, string> = {
    'Michigan_State_University_3FT_Inline_500px.jpg': 'Michigan State University Inline Display',
    'Michigan_state_University_Premium Floor Display 2.0_500px.jpg': 'Michigan State University Premium Floor Display',
    'Michigan_State_University_Tier2_Display_Floor_500px.jpg': 'Michigan State University Floor Display'
  };
  
  return rackDisplayMapping[imageName] || getProductName(imageName);
};

export const getVersionDisplayName = (version: string, imageName?: string): string => {
  // List of images that should use 'Tie-dye' prefix
  const tieDyeImages = [
    'M100965414 SHOUDC OU Go Green DTF on Forest.png',
    'M100482538 SHHODC Hover DTF on Black or Forest .png',
    'M100437896 SHOUDC Over Under DTF on Forest.png',
    'M102595496 SH2FDC Custom DTF on Maroon .png',
  ];

  let display = '';
  switch (version) {
    case 'tshirt': display = 'T-Shirt'; break;
    case 'longsleeve': display = 'Long Sleeve T-shirt'; break;
    case 'hoodie': display = 'Hoodie'; break;
    case 'crewneck': display = 'Crew Sweatshirt'; break;
    default: display = version;
  }

  if (imageName && tieDyeImages.includes(imageName)) {
    return `Tie-dye ${display}`;
  }
  return display;
};

export const hasColorVersions = (imageName: string): boolean => {
  const itemsWithColorVersions = [
    'M100482538 SHHODC Hover DTF on Black or Forest .png',
    'M100489153 SHE1CH Custom Hat on White or Grays .png',
    'M100488283 SHE1CH Custom Logo on White or Gray.png'
  ];
  return itemsWithColorVersions.includes(imageName);
};

export const getColorDisplayName = (color: string): string => {
  switch (color) {
    case 'black': return 'Black';
    case 'forest': return 'Forest';
    case 'white': return 'White Quantity';
    case 'gray': return 'Gray Quantity';
    default: return color;
  }
};
