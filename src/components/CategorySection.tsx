import React from 'react';
import { Category, ShirtVersion } from '../types';
import ProductCard from './ProductCard';
import ShirtVersionCard from './ShirtVersionCard';
import { getImagePath } from '../utils';

interface CategorySectionProps {
  category: Category;
  quantities: Record<string, string>;
  shirtVersions?: Record<string, ShirtVersion>;
  onQuantityChange?: (imagePath: string, value: string) => void;
  onShirtVersionChange?: (imagePath: string, version: keyof ShirtVersion, value: string) => void;
  readOnly?: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  quantities,
  shirtVersions = {},
  onQuantityChange,
  onShirtVersionChange,
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
          
          if (category.hasShirtVersions) {
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