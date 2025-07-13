import React from 'react';
import { Category, ShirtVersion, ColorVersion, ShirtColorComboVersion, DisplayOption, SweatpantJoggerOption } from '../types';
import ProductCard from './ProductCard';
import ShirtVersionCard from './ShirtVersionCard';
import ColorVersionCard from './ColorVersionCard';
import ShirtColorVersionCard from './ShirtColorVersionCard';
import DisplayOptionCard from './DisplayOptionCard';
import { getImagePath, hasColorVersions, getProductName } from '../utils';

interface CategorySectionProps {
  category: Category;
  quantities: Record<string, string>;
  shirtVersions?: Record<string, ShirtVersion>;
  colorVersions?: Record<string, ColorVersion>;
  shirtColorComboVersions?: Record<string, ShirtColorComboVersion>;
  displayOptions?: Record<string, DisplayOption>;
  sweatpantJoggerOptions?: Record<string, SweatpantJoggerOption>;
  onQuantityChange?: (imagePath: string, value: string) => void;
  onShirtVersionChange?: (imagePath: string, version: keyof ShirtVersion, value: string) => void;
  onColorVersionChange?: (imagePath: string, color: keyof ColorVersion, value: string) => void;
  onShirtColorComboChange?: (imagePath: string, version: string, color: string, value: string) => void;
  onDisplayOptionChange?: (imagePath: string, option: keyof DisplayOption, value: string) => void;
  onSweatpantJoggerOptionChange?: (imagePath: string, option: keyof SweatpantJoggerOption, value: string) => void;
  readOnly?: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  quantities,
  shirtVersions = {},
  colorVersions = {},
  shirtColorComboVersions = {},
  displayOptions = {},
  sweatpantJoggerOptions = {},
  onQuantityChange,
  onShirtVersionChange,
  onColorVersionChange,
  onShirtColorComboChange,
  onDisplayOptionChange,
  onSweatpantJoggerOptionChange,
  readOnly = false
}) => {
  return (
    <section style={{ 
      marginBottom: 'var(--space-6)', 
      background: 'var(--color-bg)', 
      borderRadius: 'var(--radius-lg)', 
      padding: 'var(--space-4)',
      border: '1px solid var(--color-border)'
    }}>
      <h2 style={{ 
        color: 'var(--color-primary)', 
        marginBottom: 'var(--space-4)', 
        fontSize: '1.5rem',
        fontWeight: '600',
        borderBottom: '2px solid var(--color-primary)',
        paddingBottom: 'var(--space-2)'
      }}>
        {category.name}
      </h2>
      {category.hasDisplayOptions && (
        <div style={{
          marginBottom: 'var(--space-4)',
          padding: 'var(--space-3)',
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          fontSize: '0.875rem',
          color: 'var(--color-text)',
          lineHeight: '1.5'
        }}>
          <strong>Display Only:</strong> Just the display unit without garments.<br />
          <strong>Display Standard Case Pack:</strong> Display unit includes garments.
        </div>
      )}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: 'var(--space-3)' 
      }}>
        {category.images.map((img) => {
          const imagePath = getImagePath(category.path, img);

          // List of images that should use Tie-dye and omit crewneck
          const tieDyeImages = [
            'M100965414 SHOUDC OU Go Green DTF on Forest.png',
            'M100482538 SHHODC Hover DTF on Black or Forest .png',
            'M100437896 SHOUDC Over Under DTF on Forest.png',
          ];

          // If this is a Tie-dye image, filter out 'crewneck' from available versions
          const isTieDye = tieDyeImages.includes(img);
          const filteredShirtVersions = isTieDye && category.shirtVersions
            ? category.shirtVersions.filter(v => v !== 'crewneck')
            : category.shirtVersions;

          if (category.hasDisplayOptions) {
            const displayOption = displayOptions[imagePath] || { displayOnly: '', displayStandardCasePack: '' };
            
            return (
              <DisplayOptionCard
                key={img}
                categoryPath={category.path}
                imageName={img}
                displayOption={displayOption}
                onDisplayOptionChange={onDisplayOptionChange}
                readOnly={readOnly}
              />
            );
          } else if (img === 'M100482538 SHHODC Hover DTF on Black or Forest .png') {
            // Special case for shirt with both versions and colors
            const comboVersion = shirtColorComboVersions[imagePath] || {};
            return (
              <ShirtColorVersionCard
                key={img}
                categoryPath={category.path}
                imageName={img}
                shirtColorComboVersion={comboVersion}
                availableVersions={filteredShirtVersions}
                availableColors={category.colorVersions}
                onShirtColorComboChange={onShirtColorComboChange}
                readOnly={readOnly}
              />
            );
          } else if (hasColorVersions(img)) {
            const colorVersion = colorVersions[imagePath] || { black: '', forest: '', white: '', gray: '' };
            
            return (
              <ColorVersionCard
                key={img}
                categoryPath={category.path}
                imageName={img}
                colorVersions={colorVersion}
                availableColors={category.colorVersions}
                onColorVersionChange={onColorVersionChange}
                readOnly={readOnly}
              />
            );
          } else if (category.hasShirtVersions) {
            const shirtVersion = shirtVersions[imagePath] || { tshirt: '', longsleeve: '', hoodie: '', crewneck: '' };
            
            return (
              <ShirtVersionCard
                key={img}
                categoryPath={category.path}
                imageName={img}
                shirtVersions={shirtVersion}
                availableVersions={filteredShirtVersions}
                onShirtVersionChange={onShirtVersionChange}
                readOnly={readOnly}
              />
            );
          } else {
            const quantity = quantities[imagePath] || '';
            if (readOnly && category.name === 'Sweatpants/Joggers' && sweatpantJoggerOptions) {
              const sj = sweatpantJoggerOptions[imagePath] || { sweatpantSteel: '', sweatpantOxford: '', joggerSteel: '', joggerOxford: '' };
              const options = [
                { key: 'sweatpantSteel', label: 'Straight-Leg Steel' },
                { key: 'sweatpantOxford', label: 'Straight-Leg Oxford' },
                { key: 'joggerSteel', label: 'Jogger Steel' },
                { key: 'joggerOxford', label: 'Jogger Oxford' },
              ];
              const total = options.reduce((sum, opt) => sum + Number(sj[opt.key as keyof SweatpantJoggerOption] || 0), 0);
              return (
                <div key={img} style={{
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
                    alt={img}
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
                    {getProductName(img)}
                  </div>
                  {options.map(opt => (
                    <div key={opt.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '2px' }}>
                      <span>{opt.label}:</span>
                      <span style={{ fontWeight: '500' }}>{sj[opt.key as keyof SweatpantJoggerOption] || '0'}</span>
                    </div>
                  ))}
                  <div style={{
                    fontWeight: '600',
                    marginTop: 'var(--space-2)',
                    paddingTop: 'var(--space-2)',
                    borderTop: '1px solid var(--color-border)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>Total:</span>
                    <span>{total}</span>
                  </div>
                </div>
              );
            }
            return (
              <ProductCard
                key={img}
                categoryPath={category.path}
                categoryName={category.name}
                imageName={img}
                quantity={quantity}
                onQuantityChange={onQuantityChange}
                readOnly={readOnly}
                sweatpantJoggerOption={category.name === 'Sweatpants/Joggers' ? (sweatpantJoggerOptions?.[imagePath] || {sweatpantSteel: '', sweatpantOxford: '', joggerSteel: '', joggerOxford: ''}) : undefined}
                onSweatpantJoggerOptionChange={category.name === 'Sweatpants/Joggers' ? onSweatpantJoggerOptionChange : undefined}
              />
            );
          }
        })}
      </div>
    </section>
  );
};

export default CategorySection; 