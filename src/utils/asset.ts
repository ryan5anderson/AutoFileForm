export function asset(path: string) {
  const base = process.env.PUBLIC_URL ?? "";
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * Maps college key to folder name
 * @param collegeKey - The college key (e.g., 'arizonastate', 'michiganstate', 'westvirginiauniversity', 'pittsburghuniversity')
 * @returns The folder name (e.g., 'ArizonaState', 'MichiganState', 'WestVirginiaUniversity', 'PittsburghUniversity')
 */
export function getCollegeFolderName(collegeKey: string): string {
  const folderMap: Record<string, string> = {
    'arizonastate': 'ArizonaState',
    'michiganstate': 'MichiganState',
    'westvirginiauniversity': 'WestVirginiaUniversity',
    'pittsburghuniversity': 'PittsburghUniversity'
  };
  
  return folderMap[collegeKey] || 'ArizonaState'; // Default fallback
}