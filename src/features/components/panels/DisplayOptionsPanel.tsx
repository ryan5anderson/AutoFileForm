import React from 'react';
import { DisplayOption } from '../../../types';
import { getRackDisplayName } from '../../utils';
import { asset, getCollegeFolderName } from '../../../utils/asset';
import QuantityStepper from './QuantityStepper';

interface DisplayOptionCardProps {
  categoryPath: string;
  imageName: string;
  displayOption?: DisplayOption;
  onDisplayOptionChange?: (imagePath: string, option: keyof DisplayOption, value: string) => void;
  readOnly?: boolean;
  hideImage?: boolean;
  college?: string;
  activeOption?: 'displayOnly' | 'displayStandardCasePack';
}

const DisplayOptionCard: React.FC<DisplayOptionCardProps> = ({
  categoryPath,
  imageName,
  displayOption = { displayOnly: '', displayStandardCasePack: '' },
  onDisplayOptionChange,
  readOnly = false,
  hideImage = false,
  college,
  activeOption = 'displayOnly'
}) => {
  const imagePath = `${categoryPath}/${imageName}`;
  const productName = getRackDisplayName(imageName);

  const handleOptionChange = (option: keyof DisplayOption, value: string) => {
    onDisplayOptionChange?.(imagePath, option, value);
  };

  // When hideImage is true (used in configuration panel), return just the field structure
  if (hideImage) {
    return (
      <>
        <div className="field">
          <div className="field-label">Quantity</div>
          <div className="field-control">
            <QuantityStepper
              value={Number(displayOption[activeOption] || 0)}
              onChange={(v) => handleOptionChange(activeOption, String(v))}
              disabled={readOnly}
              ariaLabel={`${activeOption === 'displayOnly' ? 'Display Only' : 'Display Standard Case Pack'} Quantity`}
            />
          </div>
        </div>
      </>
    );
  }

  // Regular card view with image and container styling
  return (
    <div style={{ 
      background: 'var(--color-bg)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-3)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)'
    }}>
      <img
        src={asset(`${getCollegeFolderName(college || '')}/${imagePath}`)}
        alt={imageName}
        style={{ 
          width: '100%', 
          borderRadius: 'var(--radius)', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid var(--color-border)'
        }}
      />
      <div style={{ 
        fontSize: '0.875rem', 
        fontWeight: '500',
        color: 'var(--color-text)',
        textAlign: 'center',
        marginBottom: 'var(--space-2)'
      }}>
        {productName}
      </div>
      
      <div className="field">
        <div className="field-label">Display Only</div>
        <div className="field-control">
          <input
            type="number"
            inputMode="numeric"
            id={`displayOnly-${imagePath}`}
            min="0"
            value={displayOption.displayOnly || ''}
            onChange={(e) => handleOptionChange('displayOnly', e.target.value)}
            disabled={readOnly}
          />
        </div>
      </div>
      <div className="field">
        <div className="field-label">Standard Case Pack</div>
        <div className="field-control">
          <input
            type="number"
            inputMode="numeric"
            id={`displayStandardCasePack-${imagePath}`}
            min="0"
            value={displayOption.displayStandardCasePack || ''}
            onChange={(e) => handleOptionChange('displayStandardCasePack', e.target.value)}
            disabled={readOnly}
          />
        </div>
      </div>
      {readOnly && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 'var(--space-1)',
          padding: 'var(--space-2)',
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '0.75rem'
          }}>
            <span style={{ fontWeight: '600', color: 'var(--color-text)' }}>Display Only:</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
              {displayOption.displayOnly || '0'}
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '0.75rem'
          }}>
            <span style={{ fontWeight: '600', color: 'var(--color-text)' }}>Display Standard Case Pack:</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
              {displayOption.displayStandardCasePack || '0'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayOptionCard; 