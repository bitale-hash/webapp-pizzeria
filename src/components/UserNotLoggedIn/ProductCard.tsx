import React from 'react';
import { MenuItem } from '../../context/PizzeriaContext';
import styles from './UserNotLoggedIn.module.css';

interface ProductCardProps {
  product: MenuItem;
  available: boolean;
  onProductClick: (product: MenuItem) => void;
}

export default function ProductCard({ product, available, onProductClick }: ProductCardProps) {
  return (
    <div className={`${styles.productCard} ${!available ? styles.productCardUnavailable : ''}`}>
      {product.image ? (
        <img src={product.image} alt={product.name} className={styles.productImage} />
      ) : (
        <div className={styles.productImagePlaceholder}>🍕 Nessuna foto</div>
      )}

      <div className={styles.productContent}>
        <div className={styles.productHeaderFlex}>
          <h3 className={styles.productName}>{product.name}</h3>
          <span className={styles.productPrice}>€ {Number(product.price).toFixed(2)}</span>
        </div>

        <p className={styles.productDesc}>{product.description || ''}</p>

        {/* Eventuali ingredienti se presenti nel tuo contesto */}
        {product.ingredientIds && product.ingredientIds.length > 0 && (
          <div className={styles.productIngredientsList}>
            {product.ingredientIds.map((ing: any) => (
              <span 
                key={ing} 
                className={`${styles.productIngredientTag} ${ing.isSpecial ? styles.productIngredientSpecial : styles.productIngredientNormal}`}
              >
                {ing.isSpecial ? '⚠️ ' : ''}{ing.name}
              </span>
            ))}
          </div>
        )}

        {!available && (
          <div className={styles.unavailableNotice}>
            ⚠️ Temporaneamente non disponibile
          </div>
        )}

        <button 
          disabled={!available}
          className={`${styles.productButton} ${!available ? styles.productButtonDisabled : ''}`}
          onClick={() => onProductClick(product)}
        >
          {available ? '🛒 Aggiungi' : 'Esaurito'}
        </button>
      </div>
    </div>
  );
}