import React from 'react';

interface CardProps {
  children: React.ReactNode;
  active?: boolean;
  expanded?: boolean;
  onClick?: () => void;
  className?: string;
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

/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-tabindex */
const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Body: React.FC<CardBodyProps>;
  Footer: React.FC<CardFooterProps>;
} = ({ children, active = false, expanded = false, onClick, className = '', style }) => {
  const cardClasses = [
    'card',
    expanded && 'card--expanded',
    active && 'card--active',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={style}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({ children, onClick }) => {
  return (
    <div 
      className="card__header"
      onClick={onClick}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e as any);
        }
      } : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

const CardBody: React.FC<CardBodyProps> = ({ children, expanded = false, title }) => {
  return (
    <div className={`card__body ${expanded ? 'card__body--expanded' : ''}`}>
      {title && (
        <h4 className="card__body-title">
          {title}
        </h4>
      )}
      <div className="flex-column gap-3">
        {children}
      </div>
    </div>
  );
};

const CardFooter: React.FC<CardFooterProps> = ({ children }) => {
  return (
    <div className="card__footer">
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
