// components/admin/panoramica/CategoryTabs.tsx
import React from 'react';
import styles from './panoramica.module.css';

interface Category {
  id: number;
  name: string;
  slug: string;
  hasIngredients: boolean;
}

interface Props {
  categories: Category[];
  activeTab: number | null;
  onSelectTab: (id: number) => void;
}

export default function CategoryTabs({ categories, activeTab, onSelectTab }: Props) {
  return (
    <div className={styles.categoryTabsContainer}>
      {categories.map(category => {
        const isActive = category.id === activeTab;
        return (
          <button
            key={category.id}
            onClick={() => onSelectTab(category.id)}
            className={`${styles.categoryTabBtn} ${isActive ? styles.categoryTabBtnActive : ''}`}
          >
            📁 {category.name}
          </button>
        );
      })}
    </div>
  );
}