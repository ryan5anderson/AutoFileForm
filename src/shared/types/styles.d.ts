// CSS Modules type definitions
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { [key: string]: string };
  export default classes;
}

// Component prop types for dynamic styling
interface StyleProps {
  className?: string;
  style?: React.CSSProperties;
}

interface ResponsiveProps {
  gap?: string;
  padding?: string;
  margin?: string;
}

interface VariantProps {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  state?: 'default' | 'active' | 'disabled';
}

// CSS custom property helper types
type CSSCustomProperty = `--${string}`;

interface DynamicStyleProps {
  [key: CSSCustomProperty]: string | number;
}

// Utility type for components that accept dynamic CSS custom properties
interface ComponentWithDynamicStyles extends StyleProps {
  style?: React.CSSProperties & DynamicStyleProps;
}

export type {
  StyleProps,
  ResponsiveProps,
  VariantProps,
  CSSCustomProperty,
  DynamicStyleProps,
  ComponentWithDynamicStyles
};