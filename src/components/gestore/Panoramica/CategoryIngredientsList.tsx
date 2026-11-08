// components/admin/panoramica/CategoryIngredientsList.tsx
import React from 'react';
import styles from './panoramica.module.css';

interface Category {
  id: number;
  name: string;
  slug: string;
  hasIngredients: boolean;
}

interface Ingredient {
  id: number;
  name: string;
  price: number;
  isSpecial: boolean;
  inStock: boolean;
}

interface Props {
  activeCategory: Category;
  ingredients: Ingredient[];
  quantities: { [key: string]: number | string };
  onQuantityChange: (categoryId: number, ingredientId: number, value: string) => void;
}

export default function CategoryIngredientsList({
  activeCategory,
  ingredients,
  quantities,
  onQuantityChange,
}: Props) {
  return (
    <div className={styles.categoryContentBox}>
      <div className={styles.categorySubHeader}>
        <span>Categoria attiva: <strong className={styles.categoryActiveStrong}>{activeCategory.name}</strong></span>
        <span className={styles.totalCountBadge}>{ingredients.length} ingredienti totali</span>
      </div>

      {ingredients.map(ingredient => {
        const key = `${activeCategory.id}-${ingredient.id}`;
        const currentQty = quantities[key] ?? '';

        return (
          <div 
            key={ingredient.id} 
            className={styles.categoryRowItem}
          >
            <div className={styles.ingredientInfo}>
              <span className={styles.ingredientMainText}>
                {ingredient.name}
              </span>
              <span className={styles.ingredientPrice}>
                Quantità standard per porzione
              </span>
            </div>
            
            <div className={styles.flexAlignCenter}>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentQty}
                onChange={(e) => onQuantityChange(activeCategory.id, ingredient.id, e.target.value)}
                placeholder="0"
                className={styles.quantityInput}
              />
              <span className={styles.unitLabel}>
                g/ml
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}