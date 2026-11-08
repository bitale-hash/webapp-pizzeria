'use client';

import React from 'react';
import CategorySection from './CategorySection';
import { MenuItem } from '../../context/PizzeriaContext';
import styles from './UserNotLoggedIn.module.css';

interface MenuCategoriesProps {
  categories: { id: number; name: string; slug: string }[];
  menu: MenuItem[];
  openCategories: { [key: number]: boolean };
  toggleCategory: (catId: number) => void;
  isProductAvailable: (product: MenuItem) => boolean;
  handleProductClick: (product: MenuItem) => void;
}

export default function MenuCategories({
  categories,
  menu,
  openCategories,
  toggleCategory,
  isProductAvailable,
  handleProductClick,
}: MenuCategoriesProps) {
  if (categories.length === 0) {
    return <p className={styles.emptyMessage}>Nessuna categoria disponibile al momento.</p>;
  }

  return (
    <div className={styles.categoriesContainer}>
      {categories.map(category => {
        const isOpen = openCategories[category.id];
        const categoryProducts = menu.filter(prod => prod.category === category.slug);

        return (
          <CategorySection
            key={category.id}
            category={category}
            isOpen={isOpen}
            categoryProducts={categoryProducts}
            onToggle={toggleCategory}
            isProductAvailable={isProductAvailable}
            onProductClick={handleProductClick}
          />
        );
      })}
    </div>
  );
}