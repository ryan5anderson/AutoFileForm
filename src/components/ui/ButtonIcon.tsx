import React from 'react';

interface ButtonIconProps {
  expanded?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  'aria-label'?: string;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
}

const ButtonIcon: React.FC<ButtonIconProps> = ({ 
  expanded = false, 
  onClick, 
  className = '',
  'aria-label': ariaLabel = 'Toggle',
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls
}) => {
  return (
    <button
      type="button"
      className={`btn-icon ${expanded ? 'btn-icon--expanded' : ''} ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded ?? expanded}
      aria-controls={ariaControls}
    >
      <svg 
        className="btn-icon__svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor"
      >
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </button>
  );
};

export default ButtonIcon;
