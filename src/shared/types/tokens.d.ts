// Design token type definitions
interface DesignTokens {
  colors: {
    primary: string;
    bg: string;
    bgAlt: string;
    text: string;
    textMuted: string;
    border: string;
    inputBg: string;
    success: string;
    danger: string;
    warning: string;
    info: string;
    // High contrast variants
    textHighContrast: string;
    textMutedHighContrast: string;
    borderHighContrast: string;
    primaryHighContrast: string;
    successHighContrast: string;
    dangerHighContrast: string;
    warningHighContrast: string;
    infoHighContrast: string;
  };
  spacing: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
  };
  breakpoints: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  containers: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  components: {
    cardPadding: string;
    cardGap: string;
    formFieldHeight: string;
    sidebarWidth: string;
  };
  typography: {
    0: string;
    1: string;
    2: string;
    3: string;
  };
  elevation: {
    1: string;
    2: string;
    3: string;
    4: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  motion: {
    fast: string;
    normal: string;
    slow: string;
    ease: string;
  };
  zIndex: {
    dropdown: number;
    nav: number;
    overlay: number;
    modal: number;
    toast: number;
  };
}

// CSS custom media query types
type BreakpointQuery = 
  | '--bp-xs'
  | '--bp-sm' 
  | '--bp-md'
  | '--bp-lg'
  | '--bp-xl'
  | '--bp-2xl';

type ContainerQuery = 
  | '--container-xs'
  | '--container-sm'
  | '--container-md'
  | '--container-lg'
  | '--container-xl'
  | '--container-2xl';

// Token accessor helper types
type ColorToken = keyof DesignTokens['colors'];
type SpacingToken = keyof DesignTokens['spacing'];
type BreakpointToken = keyof DesignTokens['breakpoints'];
type ContainerToken = keyof DesignTokens['containers'];

export type {
  DesignTokens,
  BreakpointQuery,
  ContainerQuery,
  ColorToken,
  SpacingToken,
  BreakpointToken,
  ContainerToken
};