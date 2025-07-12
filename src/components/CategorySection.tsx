import React from 'react';
import { Category, ShirtVersion, ColorVersion, ShirtColorComboVersion } from '../types';
import ProductCard from './ProductCard';
import ShirtVersionCard from './ShirtVersionCard';
import ColorVersionCard from './ColorVersionCard';
import ShirtColorVersionCard from './ShirtColorVersionCard';
import { getImagePath, hasColorVersions } from '../utils';

interface CategorySectionProps {
  category: Category;
  quantities: Record<string, string>;
  shirtVersions?: Record<string, ShirtVersion>;
  colorVersions?: Record<string, ColorVersion>;
  shirtColorComboVersions?: Record<string, ShirtColorComboVersion>;
  onQuantityChange?: (imagePath: string, value: string) => void;
  onShirtVersionChange?: (imagePath: string, version: keyof ShirtVersion, value: string) => void;
  onColorVersionChange?: (imagePath: string, color: keyof ColorVersion, value: string) => void;
  onShirtColorComboChange?: (imagePath: string, version: string, color: string, value: string) => void;
  readOnly?: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  quantities,
  shirtVersions = {},
  colorVersions = {},
  shirtColorComboVersions = {},
  onQuantityChange,
  onShirtVersionChange,
  onColorVersionChange,
  onShirtColorComboChange,
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
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: 'var(--space-3)' 
      }}>
        {category.images.map((img) => {
          const imagePath = getImagePath(category.path, img);
          
          if (img === 'M100482538 SHHODC Hover DTF on Black or Forest .png') {
            // Special case for shirt with both versions and colors
            const comboVersion = shirtColorComboVersions[imagePath] || {};
            return (
              <ShirtColorVersionCard
                key={img}
                categoryPath={category.path}
                imageName={img}
                shirtColorComboVersion={comboVersion}
                availableVersions={category.shirtVersions}
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
                availableVersions={category.shirtVersions}
                onShirtVersionChange={onShirtVersionChange}
                readOnly={readOnly}
              />
            );
          } else {
            const quantity = quantities[imagePath] || '';
            
            return (
              <ProductCard
                key={img}
                categoryPath={category.path}
                categoryName={category.name}
                imageName={img}
                quantity={quantity}
                onQuantityChange={onQuantityChange}
                readOnly={readOnly}
              />
            );
          }
        })}
      </div>
    </section>
  );
};

export default CategorySection; 