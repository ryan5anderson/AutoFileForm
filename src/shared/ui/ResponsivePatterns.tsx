import React from 'react';
import styles from './ResponsivePatterns.module.css';

/**
 * Examples of responsive design patterns using CSS Modules
 * 
 * This file demonstrates various responsive approaches:
 * 1. Container Queries (preferred)
 * 2. Media Queries (fallback)
 * 3. Fluid Typography and Spacing
 * 4. Responsive Grid Patterns
 */

// Example 1: Container Query Responsive Component
export const ContainerQueryExample: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={`${styles.containerQueryExample} ${className || ''}`}>
      <div className={styles.containerQueryExample__header}>
        Container Query Example
      </div>
      <div className={styles.containerQueryExample__content}>
        {children}
      </div>
    </div>
  );
};

// Example 2: Media Query Responsive Component
export const MediaQueryExample: React.FC<{
  children: React.ReactNode;
  layout?: 'stack' | 'sidebar';
}> = ({ children, layout = 'stack' }) => {
  return (
    <div 
      className={styles.mediaQueryExample}
      data-layout={layout}
    >
      {children}
    </div>
  );
};

// Example 3: Fluid Typography Component
export const FluidTypographyExample: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => {
  return (
    <article className={styles.fluidTypographyExample}>
      <header className={styles.fluidTypographyExample__header}>
        <h1 className={styles.fluidTypographyExample__title}>
          {title}
        </h1>
        {subtitle && (
          <p className={styles.fluidTypographyExample__subtitle}>
            {subtitle}
          </p>
        )}
      </header>
      <div className={styles.fluidTypographyExample__content}>
        {children}
      </div>
    </article>
  );
};

// Example 4: Responsive Grid Component
export const ResponsiveGridExample: React.FC<{
  children: React.ReactNode;
  minItemWidth?: string;
  gap?: string;
}> = ({ children, minItemWidth, gap }) => {
  const dynamicStyles = {
    ...(minItemWidth && { '--grid-min-width': minItemWidth }),
    ...(gap && { '--grid-gap': gap }),
  } as React.CSSProperties;

  return (
    <div 
      className={styles.responsiveGridExample}
      style={dynamicStyles}
    >
      {children}
    </div>
  );
};

// Example 5: Adaptive Card Layout
export const AdaptiveCardExample: React.FC<{
  title: string;
  content: string;
  actions?: React.ReactNode;
  orientation?: 'auto' | 'horizontal' | 'vertical';
}> = ({ title, content, actions, orientation = 'auto' }) => {
  return (
    <div 
      className={styles.adaptiveCardExample}
      data-orientation={orientation}
    >
      <div className={styles.adaptiveCardExample__content}>
        <h3 className={styles.adaptiveCardExample__title}>
          {title}
        </h3>
        <p className={styles.adaptiveCardExample__text}>
          {content}
        </p>
      </div>
      {actions && (
        <div className={styles.adaptiveCardExample__actions}>
          {actions}
        </div>
      )}
    </div>
  );
};

// Example 6: Responsive Navigation
export const ResponsiveNavExample: React.FC<{
  items: Array<{ label: string; href: string; active?: boolean }>;
  variant?: 'horizontal' | 'vertical' | 'adaptive';
}> = ({ items, variant = 'adaptive' }) => {
  return (
    <nav 
      className={styles.responsiveNavExample}
      data-variant={variant}
    >
      <ul className={styles.responsiveNavExample__list}>
        {items.map((item, index) => (
          <li 
            key={index}
            className={styles.responsiveNavExample__item}
          >
            <a 
              href={item.href}
              className={styles.responsiveNavExample__link}
              data-active={item.active}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

// Usage Examples:
/*
<ContainerQueryExample>
  <p>This component adapts based on its container width, not viewport width.</p>
</ContainerQueryExample>

<MediaQueryExample layout="sidebar">
  <div>Sidebar content</div>
  <div>Main content</div>
</MediaQueryExample>

<FluidTypographyExample 
  title="Fluid Typography" 
  subtitle="Scales smoothly with viewport"
>
  <p>Content with fluid typography that scales between minimum and maximum sizes.</p>
</FluidTypographyExample>

<ResponsiveGridExample minItemWidth="250px" gap="2rem">
  <div>Grid item 1</div>
  <div>Grid item 2</div>
  <div>Grid item 3</div>
</ResponsiveGridExample>

<AdaptiveCardExample
  title="Adaptive Card"
  content="This card changes layout based on available space"
  actions={<button>Action</button>}
  orientation="auto"
/>

<ResponsiveNavExample
  variant="adaptive"
  items={[
    { label: 'Home', href: '/', active: true },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' }
  ]}
/>
*/