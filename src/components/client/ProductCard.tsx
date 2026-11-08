import React from 'react';
import { MenuItem } from '../../context/PizzeriaContext';
import styles from './ClientHome.module.css';

interface ProductCardProps {
  product: MenuItem;
  available: boolean;
  productIngredients: any[];
  onProductClick: (product: MenuItem) => void;
  buttonText?: string;
}

export default function ProductCard({
  product,
  available,
  productIngredients,
  onProductClick,
  buttonText = '🛒 Aggiungi'
}: ProductCardProps) {
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

        {productIngredients.length > 0 && (
          <div className={styles.productIngredientsList}>
            {productIngredients.map((ing) => ing && (
              <span
                key={ing.id}
                className={`${styles.productIngredientTag} ${
                  ing.isSpecial ? styles.productIngredientSpecial : styles.productIngredientNormal
                }`}
              >
                {ing.isSpecial ? '⚠️' : ''}{ing.name}
              </span>
            ))}
          </div>
        )}

        <button
          disabled={!available}
          className={`${styles.productButton} ${!available ? styles.productButtonDisabled : ''}`}
          onClick={() => onProductClick(product)}
        >
          {available ? buttonText : 'Esaurito'}
        </button>
      </div>
    </div>
  );
}