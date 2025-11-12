import React, { useState } from 'react';

import { getPackSizeSync } from '../../../config/packSizes';
import { PantOption, SizeCounts } from '../../../types';
import { getSizeOptions } from '../../utils/calculations';

import SizePackSelector from './SizePackSelector';

interface PantOptionsPanelProps {
  pantOption: PantOption;
  onChange: (option: PantOption) => void;
  pantStyles?: string[];
  disabled?: boolean;
  categoryPath?: string;
  allowAnyQuantity?: boolean;
  collegeKey?: string;
}

const PantOptionsPanel: React.FC<PantOptionsPanelProps> = ({
  pantOption,
  onChange,
  pantStyles = ['sweatpants', 'joggers'],
  disabled = false,
  categoryPath = 'pants',
  allowAnyQuantity = false,
  collegeKey,
}) => {
  const [activeTab, setActiveTab] = useState<string>(pantStyles[0] || 'sweatpants');
  const packSize = getPackSizeSync(categoryPath);
  const sizes = getSizeOptions(categoryPath, undefined, collegeKey);

  const handleSizeCountsChange = (style: 'sweatpants' | 'joggers', color: 'steel' | 'black' | 'darkHeather' | 'darkNavy', counts: SizeCounts) => {
    const newOption = { ...pantOption };

    if (!newOption[style]) {
      newOption[style] = {};
    }

    // Use type assertion to handle the different color structures for each style
    if (style === 'sweatpants') {
      (newOption[style] as { steel?: SizeCounts; black?: SizeCounts; darkNavy?: SizeCounts })[color as 'steel' | 'black' | 'darkNavy'] = counts;
    } else {
      (newOption[style] as { steel?: SizeCounts; darkHeather?: SizeCounts })[color as 'steel' | 'darkHeather'] = counts;
    }

    onChange(newOption);
  };

  const getSizeCounts = (style: 'sweatpants' | 'joggers', color: 'steel' | 'black' | 'darkHeather' | 'darkNavy'): SizeCounts => {
    if (style === 'sweatpants') {
      return (pantOption[style] as { steel?: SizeCounts; black?: SizeCounts; darkNavy?: SizeCounts })?.[color as 'steel' | 'black' | 'darkNavy'] || { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0, SM: 0 };
    } else {
      return (pantOption[style] as { steel?: SizeCounts; darkHeather?: SizeCounts })?.[color as 'steel' | 'darkHeather'] || { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0, SM: 0 };
    }
  };

  const renderColorOptions = (style: 'sweatpants' | 'joggers') => {
    if (style === 'joggers') {
      // Joggers only have 2 colors - keep in one row
      const colors: Array<'steel' | 'darkHeather'> = ['steel', 'darkHeather'];
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 'var(--space-3)',
          width: '100%'
        }}>
          {colors.map((color) => (
            <div key={color} style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: 'var(--space-2)',
              flex: '1',
              minWidth: 0
            }}>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: '600',
                marginBottom: '0.35rem',
                color: 'var(--color-text)'
              }}>
                {color === 'steel' ? 'Steel' : 'Dark Heather'}
              </div>
              <SizePackSelector
                counts={getSizeCounts(style, color)}
                onChange={(counts) => handleSizeCountsChange(style, color, counts)}
                packSize={packSize}
                sizes={sizes}
                disabled={disabled}
                allowAnyQuantity={allowAnyQuantity}
                categoryPath={categoryPath}
                version={style}
              />
            </div>
          ))}
        </div>
      );
    } else {
      // Sweatpants have 3 colors - split into two rows
      const firstRowColors: Array<'steel' | 'black'> = ['steel', 'black'];
      const secondRowColors: Array<'darkNavy'> = ['darkNavy'];

      return (
        <div style={{ width: '100%' }}>
          {/* First row with Steel and Black */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 'var(--space-3)',
            width: '100%',
            marginBottom: 'var(--space-3)'
          }}>
            {firstRowColors.map((color) => (
              <div key={color} style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                padding: 0,
                flex: '1',
                minWidth: 0
              }}>
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  marginBottom: '0.35rem',
                  color: 'var(--color-text)'
                }}>
                  {color === 'steel' ? 'Steel' : 'Black'}
                </div>
                <SizePackSelector
                  counts={getSizeCounts(style, color)}
                  onChange={(counts) => handleSizeCountsChange(style, color, counts)}
                  packSize={packSize}
                  sizes={sizes}
                  disabled={disabled}
                  allowAnyQuantity={allowAnyQuantity}
                />
              </div>
            ))}
          </div>

          {/* Second row with Dark Navy centered */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%'
          }}>
            {secondRowColors.map((color) => (
              <div key={color} style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                padding: 'var(--space-2)',
                width: '50%',
                maxWidth: '300px'
              }}>
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  marginBottom: '0.35rem',
                  color: 'var(--color-text)'
                }}>
                  Dark Navy
                </div>
                <SizePackSelector
                  counts={getSizeCounts(style, color)}
                  onChange={(counts) => handleSizeCountsChange(style, color, counts)}
                  packSize={packSize}
                  sizes={sizes}
                  disabled={disabled}
                  allowAnyQuantity={allowAnyQuantity}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Tab Navigation - matching t-shirt style */}
      <div className="product-detail-tabs">
        {pantStyles.map((style) => (
          <button
            key={style}
            type="button"
            onClick={() => setActiveTab(style)}
            className={`product-detail-tab ${activeTab === style ? 'product-detail-tab--active' : ''}`}
            disabled={disabled}
          >
            {style === 'sweatpants' ? 'Sweatpants' : 'Joggers'}
          </button>
        ))}
      </div>
      <div style={{ textAlign: 'center' }}>Choose your sizes or select a curated pack</div>

      {/* Tab Content */}
      <div className="product-detail-tab-content">
        {pantStyles.map((style) => (
          <div 
            key={style}
            className="product-detail-tab-panel"
            style={{ display: activeTab === style ? 'block' : 'none' }}
          >
            {renderColorOptions(style as 'sweatpants' | 'joggers')}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PantOptionsPanel;

