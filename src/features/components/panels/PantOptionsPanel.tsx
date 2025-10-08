import React, { useState } from 'react';
import { PantOption } from '../../../types';
import QuantityStepper from './QuantityStepper';
import { getPackSize } from '../../../config/packSizes';

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

  const handleColorChange = (style: 'sweatpants' | 'joggers', color: 'steel' | 'oxford', value: number) => {
    const newOption = { ...pantOption };
    
    if (!newOption[style]) {
      newOption[style] = { steel: '0', oxford: '0' };
    }
    
    newOption[style]![color] = String(value);
    onChange(newOption);
  };

  const getColorValue = (style: 'sweatpants' | 'joggers', color: 'steel' | 'oxford'): number => {
    return Number(pantOption[style]?.[color] || 0);
  };

  const renderColorOptions = (style: 'sweatpants' | 'joggers') => {
    const styleLabel = style === 'sweatpants' ? 'Sweatpants' : 'Joggers';
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 'var(--space-3)',
        width: '100%'
      }}>
        {/* Steel Color Option */}
        <div style={{
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
            Steel
          </div>
          <QuantityStepper
            value={getColorValue(style, 'steel')}
            onChange={(v) => handleColorChange(style, 'steel', v)}
            disabled={disabled}
            ariaLabel={`${styleLabel} Steel quantity`}
            step={packSize}
          />
        </div>

        {/* Oxford Color Option */}
        <div style={{
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
            Oxford
          </div>
          <QuantityStepper
            value={getColorValue(style, 'oxford')}
            onChange={(v) => handleColorChange(style, 'oxford', v)}
            disabled={disabled}
            ariaLabel={`${styleLabel} Oxford quantity`}
            step={packSize}
          />
        </div>
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

