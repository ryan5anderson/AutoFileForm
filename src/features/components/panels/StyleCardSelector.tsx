import React from 'react';

export interface StyleOption {
  id: string;
  label: string;
  imageSrc: string;
}

interface StyleCardSelectorProps {
  options: StyleOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

const StyleCardSelector: React.FC<StyleCardSelectorProps> = ({
  options,
  selectedId,
  onSelect,
  disabled = false,
}) => {
  return (
    <div className="style-card-grid" role="group" aria-label="Choose garment style">
      {options.map((opt) => {
        const isSelected = selectedId === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            className={`style-card ${isSelected ? 'style-card--selected' : ''}`}
            onClick={() => !disabled && onSelect(opt.id)}
            disabled={disabled}
            aria-pressed={isSelected}
            aria-label={`Select ${opt.label}`}
          >
            <div className="style-card__image-wrap">
              <img src={opt.imageSrc} alt="" className="style-card__image" />
            </div>
            <span className="style-card__label">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default StyleCardSelector;
