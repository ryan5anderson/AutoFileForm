import React from 'react';
import { DisplayOption } from '../types';
import { getImagePath, getRackDisplayName } from '../utils';

interface DisplayOptionCardProps {
  categoryPath: string;
  imageName: string;
  displayOption?: DisplayOption;
  onDisplayOptionChange?: (imagePath: string, option: keyof DisplayOption, value: string) => void;
  readOnly?: boolean;
}

const DisplayOptionCard: React.FC<DisplayOptionCardProps> = ({
  categoryPath,
  imageName,
  displayOption = { displayOnly: '', displayStandardCasePack: '' },
  onDisplayOptionChange,
  readOnly = false
}) => {
  const imagePath = getImagePath(categoryPath, imageName);
  const productName = getRackDisplayName(imageName);

  const handleOptionChange = (option: keyof DisplayOption, value: string) => {
    onDisplayOptionChange?.(imagePath, option, value);
  };

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
        src={process.env.PUBLIC_URL + `/MichiganState/${imagePath}`}
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
      
      {!readOnly ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 'var(--space-2)',
          padding: 'var(--space-2)',
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-2)',
            justifyContent: 'space-between',
            width: '100%'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--color-text)',
              flex: 1,
              minWidth: 0
            }}>
              Display Only:
            </span>
            <input
              type="number"
              id={`displayOnly-${imagePath}`}
              min="0"
              value={displayOption.displayOnly}
              onChange={(e) => handleOptionChange('displayOnly', e.target.value)}
              style={{
                width: '60px',
                padding: 'var(--space-1) var(--space-2)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                fontSize: '0.875rem',
                background: 'var(--color-input-bg)',
                textAlign: 'center',
                flexShrink: 0
              }}
            />
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-2)',
            justifyContent: 'space-between',
            width: '100%'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--color-text)',
              flex: 1,
              minWidth: 0
            }}>
              Standard Case Pack:
            </span>
            <input
              type="number"
              id={`displayStandardCasePack-${imagePath}`}
              min="0"
              value={displayOption.displayStandardCasePack}
              onChange={(e) => handleOptionChange('displayStandardCasePack', e.target.value)}
              style={{
                width: '60px',
                padding: 'var(--space-1) var(--space-2)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                fontSize: '0.875rem',
                background: 'var(--color-input-bg)',
                textAlign: 'center',
                flexShrink: 0
              }}
            />
          </div>
        </div>
      ) : (
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