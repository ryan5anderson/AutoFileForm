import React from 'react';
import styles from './ComponentTemplate.module.css';

/**
 * Template component demonstrating CSS Module patterns
 * 
 * Copy this file and rename to create new components following
 * the established patterns for the UI system unification.
 */

interface ComponentTemplateProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  disabled?: boolean;
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  // Add custom props here
  customGap?: string;
  customPadding?: string;
}

// Helper function to build CSS class names
const buildComponentClassName = (
  variant: 'default' | 'primary' | 'secondary' = 'default',
  size: 'sm' | 'md' | 'lg' = 'md',
  className?: string
): string => {
  const classes = [styles.componentTemplate];

  // Add variant classes (skip 'default' to keep CSS minimal)
  if (variant !== 'default') {
    classes.push(styles[`componentTemplate--${variant}`]);
  }

  // Add size classes (skip 'md' as it's the default)
  if (size !== 'md') {
    classes.push(styles[`componentTemplate--${size}`]);
  }

  // Add custom className if provided
  if (className) {
    classes.push(className);
  }

  return classes.join(' ');
};

const ComponentTemplate: React.FC<ComponentTemplateProps> = ({
  children,
  variant = 'default',
  size = 'md',
  active = false,
  disabled = false,
  interactive = false,
  className,
  style,
  onClick,
  customGap,
  customPadding,
  ...rest
}) => {
  // Build dynamic styles using CSS custom properties
  const dynamicStyles = {
    ...style,
    ...(customGap && { '--component-gap': customGap }),
    ...(customPadding && { '--component-padding': customPadding }),
  } as React.CSSProperties;

  // Determine if component should be interactive
  const isInteractive = interactive || !!onClick;

  return (
    <div
      className={buildComponentClassName(variant, size, className)}
      data-active={active}
      data-disabled={disabled}
      data-interactive={isInteractive}
      onClick={disabled ? undefined : onClick}
      style={dynamicStyles}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={onClick && !disabled ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      {...rest}
    >
      {children}
    </div>
  );
};

export default ComponentTemplate;

// Example usage:
/*
<ComponentTemplate 
  variant="primary" 
  size="lg" 
  active={true}
  onClick={() => console.log('clicked')}
  customGap="2rem"
  customPadding="1.5rem"
>
  Template content
</ComponentTemplate>
*/