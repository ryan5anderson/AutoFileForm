import React, { useState } from 'react';
import { PantOption, SizeCounts } from '../../../types';
import SizePackSelector from './SizePackSelector';
import { getPackSize } from '../../../config/packSizes';
import { getSizeOptions } from '../../utils/calculations';

interface PantOptionsPanelProps {
  pantOption: PantOption;
  onChange: (option: PantOption) => void;
  pantStyles?: string[];
  disabled?: boolean;
  categoryPath?: string;
}

const PantOptionsPanel: React.FC<PantOptionsPanelProps> = ({
  pantOption,
  onChange,
  pantStyles = ['sweatpants', 'joggers'],
  disabled = false,
  categoryPath = 'pants'
}) => {
  const [activeTab, setActiveTab] = useState<string>(pantStyles[0] || 'sweatpants');
  const packSize = getPackSize(categoryPath);
  const sizes = getSizeOptions(categoryPath);

  const handleSizeCountsChange = (style: 'sweatpants' | 'joggers', color: 'steel' | 'oxford', counts: SizeCounts) => {
    const newOption = { ...pantOption };

    if (!newOption[style]) {
      newOption[style] = {};
    }

    newOption[style]![color] = counts;
    onChange(newOption);
  };

  const getSizeCounts = (style: 'sweatpants' | 'joggers', color: 'steel' | 'oxford'): SizeCounts => {
    return pantOption[style]?.[color] || { S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, 'S/M': 0, 'L/XL': 0 };
  };

  const renderColorOptions = (style: 'sweatpants' | 'joggers') => {
    const colors: Array<'steel' | 'oxford'> = ['steel', 'oxford'];

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
              {color === 'steel' ? 'Steel' : 'Oxford'}
            </div>
            <SizePackSelector
              counts={getSizeCounts(style, color)}
              onChange={(counts) => handleSizeCountsChange(style, color, counts)}
              packSize={packSize}
              sizes={sizes}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
    );
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

