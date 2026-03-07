import React from 'react';

export interface StyleOption {
  id: string;
  label: string;
  imageSrc: string;
  iconType?: 'hoodie' | 'longsleeve' | 'crewneck';
}

interface StyleCardSelectorProps {
  options: StyleOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

const HoodieIcon: React.FC<{ color?: string; strokeWidth?: number }> = ({
  color = '#374151',
  strokeWidth = 2,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="style-card__icon"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}>
        <path d="M17.64 12c-.1.745-.06 1.5.019 3.011L18 19.522c0 .707-.12 1.085-.755 1.426c-2.613 1.403-7.877 1.403-10.49 0c-.635-.341-.755-.72-.755-1.426l.341-4.51c.08-1.511.119-2.267.018-3.012" />
        <path d="M14 17c0 .875.419 1.419 1 2m-5-2c0 .875-.419 1.419-1 2" />
        <path d="m7.4 6.897l3.882 1.85c.354.169.531.253.718.253s.364-.084.718-.253l3.882-1.85c.86-.409 1.29-.614 1.382-1.138c.093-.525-.18-.833-.724-1.45c-2.722-3.079-7.794-3.079-10.516 0c-.545.617-.817.925-.724 1.45s.523.729 1.382 1.138" />
        <path d="m14 6l-2 3l-2-3m-3.616.5c-1.35.267-2.557 1.52-3.395 2.642c-.537.718-.805 1.078-.938 1.741c-.133.664.007 1.218.287 2.325l1.3 5.13c.23.908 1.362.773 2.362-.236M17.616 6.5c1.35.267 2.557 1.52 3.395 2.642c.537.718.805 1.078.938 1.741c.133.664-.007 1.218-.287 2.325l-1.3 5.13c-.23.908-1.362.765-2.362.268" />
      </g>
    </svg>
  );
};

const LongSleeveShirtIcon: React.FC<{ color?: string; strokeWidth?: number }> = ({
  color = '#374151',
  strokeWidth = 2,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="style-card__icon"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}>
        <path d="M5.5 7c.329.986.719 1.984.86 3.02c.1.743.06 1.497-.019 3.005L6 19.527c0 .705.12 1.082.755 1.423c2.613 1.4 7.877 1.4 10.49 0c.635-.34.755-.718.755-1.423l-.341-6.502c-.08-1.508-.119-2.262-.018-3.006c.14-1.035.53-2.033.859-3.019" />
        <path d="M5.971 18.513c-.466.233-.932.537-1.474.479c-.917-.098-1.13-.54-1.317-1.649L2.1 10.921c-.145-.858-.145-.865.083-1.706l.538-1.983c.364-1.342.546-2.013.982-2.525c.437-.512 1.072-.8 2.343-1.375L8.59 2.179c.395-.178.398-.179.832-.179h5.156c.434 0 .437 0 .832.18l2.544 1.152c1.271.575 1.906.863 2.343 1.375c.436.512.618 1.183.982 2.525l.538 1.983c.228.84.228.848.083 1.706l-1.08 6.422c-.187 1.11-.401 1.552-1.32 1.65c-.567.06-.981-.234-1.474-.48" />
        <path d="M9 2.5s.908 1.915 1.66 2.314c.387.204.87.186 1.34.186s.953.018 1.34-.186C14.091 4.414 15 2.5 15 2.5" />
      </g>
    </svg>
  );
};

const CrewneckIcon: React.FC<{ color?: string; strokeWidth?: number }> = ({
  color = '#374151',
  strokeWidth = 2,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="style-card__icon"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5.5 7c.329.986.719 1.984.86 3.02c.1.743.06 1.497-.019 3.005L6 19.527c0 .705.12 1.082.755 1.423c2.613 1.4 7.877 1.4 10.49 0c.635-.34.755-.718.755-1.423l-.341-6.502c-.08-1.508-.119-2.262-.018-3.006c.14-1.035.53-2.033.859-3.019" />
      <path d="M5.971 18.513c-.466.233-.932.537-1.474.479c-.917-.098-1.13-.54-1.317-1.649L2.1 10.921c-.145-.858-.145-.865.083-1.706l.538-1.983c.364-1.342.546-2.013.982-2.525c.437-.512 1.072-.8 2.343-1.375L8.59 2.179c.395-.178.398-.179.832-.179h5.156c.434 0 .437 0 .832.18l2.544 1.152c1.271.575 1.906.863 2.343 1.375c.436.512.618 1.183.982 2.525l.538 1.983c.228.84.228.848.083 1.706l-1.08 6.422c-.187 1.11-.401 1.552-1.32 1.65c-.567.06-.981-.234-1.474-.48" />
      <path d="M8.2 2.5 C8.8 5.2 15.2 5.2 15.8 2.5" strokeWidth={strokeWidth * 1.1} />
      <path d="M9.0 2.5 C9.5 4.2 14.5 4.2 15.0 2.5" strokeWidth={strokeWidth * 0.8} strokeDasharray="none" />
      <path d="M10.0 2.8 L10.0 4.6" strokeWidth={strokeWidth * 1.2} strokeLinecap="butt" />
      <path d="M12.0 2.5 L12.0 4.7" strokeWidth={strokeWidth * 1.2} strokeLinecap="butt" />
      <path d="M14.0 2.8 L14.0 4.6" strokeWidth={strokeWidth * 1.2} strokeLinecap="butt" />
      <path d="M10.5 5.2 L12.0 7.5 L13.5 5.2" strokeWidth={strokeWidth * 0.85} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const StyleCardSelector: React.FC<StyleCardSelectorProps> = ({
  options,
  selectedId,
  onSelect,
  disabled = false,
}) => {
  return (
    <div className="style-card-carousel" role="group" aria-label="Choose garment style">
      <div className="style-card-carousel__track">
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
                {opt.iconType === 'hoodie' ? (
                  <HoodieIcon />
                ) : opt.iconType === 'longsleeve' ? (
                  <LongSleeveShirtIcon />
                ) : opt.iconType === 'crewneck' ? (
                  <CrewneckIcon />
                ) : (
                  <img src={opt.imageSrc} alt="" className="style-card__image" />
                )}
              </div>
              <span className="style-card__label">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StyleCardSelector;
