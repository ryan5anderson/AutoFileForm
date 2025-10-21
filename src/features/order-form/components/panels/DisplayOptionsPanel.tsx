import React from 'react';
import { DisplayOption } from '../../../../shared/types';
import { getImagePath, getRackDisplayName } from '../../utils';
import { asset, getCollegeFolderName } from '../../../../shared/utils/asset';
import QuantityStepper from './QuantityStepper';
import styles from './DisplayOptionsPanel.module.css';

interface DisplayOptionCardProps {
  categoryPath: string;
  imageName: string;
  displayOption?: DisplayOption;
  onDisplayOptionChange?: (imagePath: string, option: keyof DisplayOption, value: string) => void;
  readOnly?: boolean;
  hideImage?: boolean;
  college?: string;
  activeOption?: 'displayOnly' | 'displayStandardCasePack';
  gap?: string;
  padding?: string;
}

const DisplayOptionCard: React.FC<DisplayOptionCardProps> = ({
  categoryPath,
  imageName,
  displayOption = { displayOnly: '', displayStandardCasePack: '' },
  onDisplayOptionChange,
  readOnly = false,
  hideImage = false,
  college,
  activeOption = 'displayOnly',
  gap,
  padding
}) => {
  const imagePath = getImagePath(categoryPath, imageName);
  const productName = getRackDisplayName(imageName);

  const handleOptionChange = (option: keyof DisplayOption, value: string) => {
    onDisplayOptionChange?.(imagePath, option, value);
  };

  // When hideImage is true (used in configuration panel), return just the field structure
  if (hideImage) {
    return (
      <>
        <div className="field">
          <label className="field-label" htmlFor={`display-quantity-${activeOption}-${imagePath}`}>Quantity</label>
          <div className="field-control">
            <QuantityStepper
              value={Number(displayOption[activeOption] || 0)}
              onChange={(v) => handleOptionChange(activeOption, String(v))}
              disabled={readOnly}
              ariaLabel={`${activeOption === 'displayOnly' ? 'Display Only' : 'Display Standard Case Pack'} Quantity`}
              inputId={`display-quantity-${activeOption}-${imagePath}`}
            />
          </div>
        </div>
      </>
    );
  }

  // Create dynamic style props for CSS custom properties
  const dynamicStyles = {
    ...(gap && { '--display-option-gap': gap }),
    ...(padding && { '--display-option-padding': padding })
  } as React.CSSProperties;

  // Regular card view with image and container styling
  return (
    <div 
      className={`${styles.displayOptionCard} ${gap || padding ? styles['displayOptionCard--dynamic'] : ''}`}
      style={dynamicStyles}
    >
      <img
        src={asset(`${getCollegeFolderName(college || '')}/${imagePath}`)}
        alt={imageName}
        className={styles.displayOptionCard__image}
      />
      <div className={styles.displayOptionCard__productName}>
        {productName}
      </div>
      
      <div className="field">
        <label className="field-label" htmlFor={`displayOnly-${imagePath}`}>Display Only</label>
        <div className="field-control">
          <input
            type="number"
            inputMode="numeric"
            id={`displayOnly-${imagePath}`}
            min="0"
            value={displayOption.displayOnly || ''}
            onChange={(e) => handleOptionChange('displayOnly', e.target.value)}
            disabled={readOnly}
            autoComplete="off"
            name={`displayOnly-${imagePath}`}
          />
        </div>
      </div>
      <div className="field">
        <label className="field-label" htmlFor={`displayStandardCasePack-${imagePath}`}>Standard Case Pack</label>
        <div className="field-control">
          <input
            type="number"
            inputMode="numeric"
            id={`displayStandardCasePack-${imagePath}`}
            min="0"
            value={displayOption.displayStandardCasePack || ''}
            onChange={(e) => handleOptionChange('displayStandardCasePack', e.target.value)}
            disabled={readOnly}
            autoComplete="off"
            name={`displayStandardCasePack-${imagePath}`}
          />
        </div>
      </div>
      {readOnly && (
        <div className={styles.displayOptionCard__readOnlyInfo}>
          <div className={styles.displayOptionCard__readOnlyRow}>
            <span className={styles.displayOptionCard__readOnlyLabel}>Display Only:</span>
            <span className={styles.displayOptionCard__readOnlyValue}>
              {displayOption.displayOnly || '0'}
            </span>
          </div>
          <div className={styles.displayOptionCard__readOnlyRow}>
            <span className={styles.displayOptionCard__readOnlyLabel}>Display Standard Case Pack:</span>
            <span className={styles.displayOptionCard__readOnlyValue}>
              {displayOption.displayStandardCasePack || '0'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayOptionCard; 