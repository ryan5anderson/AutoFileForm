import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  active?: boolean;
  expanded?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  interactive?: boolean;
  style?: React.CSSProperties;
}

interface CardHeaderProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

interface CardBodyProps {
  children: React.ReactNode;
  expanded?: boolean;
  title?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
}

// Helper function to build CSS class names
const buildCardClassName = (
  variant: 'default' | 'elevated' | 'outlined' = 'default',
  className?: string
): string => {
  const classes = [styles.card];
  
  if (variant !== 'default') {
    classes.push(styles[`card--${variant}`]);
  }
  
  if (className) {
    classes.push(className);
  }
  
  return classes.join(' ');
};

const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Body: React.FC<CardBodyProps>;
  Footer: React.FC<CardFooterProps>;
} = ({ 
  children, 
  active = false, 
  expanded = false, 
  onClick, 
  className = '', 
  variant = 'default',
  interactive = false,
  style,
  ...rest
}) => {
  const isInteractive = interactive || !!onClick;
  
  return (
    <section
      className={buildCardClassName(variant, className)}
      data-active={active}
      data-expanded={expanded}
      data-interactive={isInteractive}
      onClick={onClick}
      style={style}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      {...rest}
    >
      {children}
    </section>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({ children, onClick }) => {
  return (
    <header
      className={styles.cardHeader}
      data-clickable={!!onClick}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e as any);
        }
      } : undefined}
    >
      {children}
    </header>
  );
};

const CardBody: React.FC<CardBodyProps> = ({ children, expanded = false, title }) => {
  return (
    <div 
      className={styles.cardBody}
      data-expanded={expanded}
    >
      {title && (
        <h4 className={styles.cardTitle}>
          {title}
        </h4>
      )}
      {children}
    </div>
  );
};

const CardFooter: React.FC<CardFooterProps> = ({ children }) => {
  return (
    <footer className={styles.cardFooter}>
      {children}
    </footer>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
