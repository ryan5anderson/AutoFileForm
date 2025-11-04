export function asset(path: string) {
  // Remove leading slash to make it relative
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  
  // For GitHub Pages, use relative paths without PUBLIC_URL
  return cleanPath;
}

/**
 * Maps college key to folder name
 * @param collegeKey - The college key (e.g., 'arizonastate', 'michiganstate', 'oregonuniversity', 'westvirginiauniversity', 'pittsburghuniversity', 'alabamauniversity')
 * @returns The folder name (e.g., 'ArizonaState', 'MichiganState', 'OregonUniversity', 'WestVirginiaUniversity', 'PittsburghUniversity', 'AlabamaUniversity')
 */
export function getCollegeFolderName(collegeKey: string): string {
  const folderMap: Record<string, string> = {
    'arizonastate': 'ArizonaState',
    'michiganstate': 'MichiganState',
    'oregonuniversity': 'OregonUniversity',
    'westvirginiauniversity': 'WestVirginiaUniversity',
    'pittsburghuniversity': 'PittsburghUniversity',
    'alabamauniversity': 'AlabamaUniversity'
  };
  
  return folderMap[collegeKey] || 'ArizonaState'; // Default fallback
}