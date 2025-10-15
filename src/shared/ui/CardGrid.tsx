import React from 'react';
import styles from './CardGrid.module.css';

interface CardGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: string;
  minCardWidth?: string;
  className?: string;
}

interface CardGridHeaderProps {
  children: React.ReactNode;
}

interface CardGridTitleProps {
  children: React.ReactNode;
}

interface CardGridDescriptionProps {
  children: React.ReactNode;
}

const CardGridHeader: React.FC<CardGridHeaderProps> = ({ children }) => (
  <div className={styles.cardGridHeader}>
    {children}
  </div>
);

const CardGridTitle: React.FC<CardGridTitleProps> = ({ children }) => (
  <h1 className={styles.cardGridTitle}>
    {children}
  </h1>
);

const CardGridDescription: React.FC<CardGridDescriptionProps> = ({ children }) => (
  <p className={styles.cardGridDescription}>
    {children}
  </p>
);

const CardGrid: React.FC<CardGridProps> & {
  Header: typeof CardGridHeader;
  Title: typeof CardGridTitle;
  Description: typeof CardGridDescription;
} = ({ 
  children, 
  columns = 3, 
  gap = 'var(--space-4)', 
  minCardWidth,
  className 
}) => {
  const gridStyle = {
    '--grid-columns': columns,
    '--grid-gap': gap,
    '--min-card-width': minCardWidth || 'auto',
  } as React.CSSProperties;

  return (
    <div 
      className={`${styles.cardGrid} ${className || ''}`}
      style={gridStyle}
    >
      {children}
    </div>
  );
};

// Attach compound components
CardGrid.Header = CardGridHeader;
CardGrid.Title = CardGridTitle;
CardGrid.Description = CardGridDescription;

export default CardGrid;