//components/gestore/Panoramica/IngredientControlSection.tsx
'use client';

import React from 'react';
import styles from './panoramica.module.css';

interface Ingredient {
  id: number;
  name: string;
  price: number;
  isSpecial: boolean;
  inStock: boolean;
}

interface IngredientControlSectionProps {
  ingredients: Ingredient[];
  updatingId: number | null;
  onToggleStock: (id: number, currentInStock: boolean) => void;
}

export default function IngredientControlSection({
  ingredients,
  updatingId,
  onToggleStock,
}: IngredientControlSectionProps) {
  return (
    <section className={styles.ingredientsSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionHeading}>
          🍅 Controllo Ingredienti
        </h2>
        <span className={styles.badgeCount}>
          {ingredients.length} totali
        </span>
      </div>

      {ingredients.length === 0 ? (
        <p className={styles.noDataText}>Nessun ingrediente trovato.</p>
      ) : (
        <div className={styles.ingredientsListContainer}>
          {ingredients.map(ing => {
            // Determina quale classe applicare per il bordo sinistro colorato
            let rowModifierClass = styles.rowAvailable;
            if (ing.isSpecial) {
              rowModifierClass = styles.rowSpecial;
            } else if (!ing.inStock) {
              rowModifierClass = styles.rowUnavailable;
            }

            return (
              <div 
                key={ing.id} 
                className={`${styles.ingredientRow} ${rowModifierClass}`}
              >
                <div className={styles.ingredientInfo}>
                  <span className={styles.ingredientMainText}>
                    {ing.name} <span className={styles.priceSpan}>(€ {Number(ing.price).toFixed(2)})</span>
                  </span>
                  
                  <div className={styles.subInfoLine}>
                    {ing.isSpecial && (
                      <span className={styles.specialTag}>⚠️ [Speciale/Allergene]</span>
                    )}
                    <span className={`${ing.inStock ? styles.statusGreen : styles.statusRed} ${styles.boldText}`}>
                      {ing.inStock ? '• Disponibile' : '• Finito'}
                    </span>
                  </div>
                </div>

                {/* Bottone Toggle unificato */}
                <button
                  disabled={updatingId === ing.id}
                  onClick={() => onToggleStock(ing.id, ing.inStock)}
                  className={`${styles.toggleBtn} ${ing.inStock ? styles.btnMakeUnavailable : styles.btnMakeAvailable}`}
                >
                  {updatingId === ing.id ? '...' : (ing.inStock ? 'Segna Finito' : 'Ripristina')}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}