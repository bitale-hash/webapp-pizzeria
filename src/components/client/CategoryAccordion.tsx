import React from 'react';
import { MenuItem } from '../../context/PizzeriaContext';
import ProductCard from './ProductCard'; 
import styles from './ClientHome.module.css';

interface CategoryAccordionProps {
  category: {
    id: number;
    name: string;
    slug: string;
  };
  isOpen: boolean;
  categoryProducts: MenuItem[];
  ingredientsMap: Map<number, any>;
  isProductAvailable: (product: MenuItem) => boolean;
  onToggleCategory: (catId: number) => void;
  onProductClick: (product: MenuItem) => void;
  productButtonText?: string;
}

export default function CategoryAccordion({
  category,
  isOpen,
  categoryProducts,
  ingredientsMap,
  isProductAvailable,
  onToggleCategory,
  onProductClick,
  productButtonText
}: CategoryAccordionProps) {
    
  return (
    <div className={styles.categoryCard}>
      <div 
        onClick={() => onToggleCategory(category.id)}
        className={styles.categoryHeader}
      >
        <h2 className={styles.categoryTitle}>
          {category.name} <span className={styles.categoryCount}>({categoryProducts.length})</span>
        </h2>
        <span className={styles.categoryToggleText}>{isOpen ? 'Chiudi ▲' : 'Apri ▼'}</span>
      </div>

      {isOpen && (
        <div className={styles.categoryBody}>
          {categoryProducts.length === 0 ? (
            <p className={styles.emptyCategoryMessage}>Nessun prodotto in questa categoria.</p>
          ) : (
            <div className={styles.productsGrid}>
              {categoryProducts.map(product => {
                const available = isProductAvailable(product);
                
                const productIngredients = product.ingredientIds 
                  ? product.ingredientIds.map(id => ingredientsMap.get(id)).filter(Boolean)
                  : [];

                return (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    available={available}
                    productIngredients={productIngredients}
                    onProductClick={onProductClick}
                    buttonText={productButtonText}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}