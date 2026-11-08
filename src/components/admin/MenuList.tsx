//components/admin/MenuList.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePizzeria } from '../../context/PizzeriaContext';
import styles from './MenuList.module.css';

export default function MenuList() {
  const { menu, categories, ingredients, deleteProduct, reorderCategories, reorderProducts } = usePizzeria();
  const [openCategories, setOpenCategories] = useState<{ [key: number]: boolean }>({});

  const toggleCategory = (id: number) => {
    setOpenCategories(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newCategories.length) return;

    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;

    await reorderCategories(newCategories);
  };

  if (categories.length === 0) {
    return <p className={styles.noCategories}>Nessuna categoria disponibile.</p>;
  }

  return (
    <div className={styles.container}>
      {categories.map((category, index) => {
        const isOpen = openCategories[category.id] ?? false;
        const categoryProducts = menu.filter(prod => prod.category === category.slug);

        return (
          <div key={category.id} className={styles.categoryCard}>
            
            <div 
              onClick={() => toggleCategory(category.id)}
              className={styles.categoryHeader}
            >
              <h3 className={styles.categoryTitle}>
                {category.name} <span className={styles.categoryCount}>({categoryProducts.length})</span>
              </h3>

              <div className={styles.categoryActions} onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => handleMoveCategory(index, 'up')}
                  disabled={index === 0}
                  className={`${styles.moveButton} ${index === 0 ? styles.disabled : ''}`}
                  title="Sposta categoria su"
                >
                  ▲
                </button>

                <button 
                  onClick={() => handleMoveCategory(index, 'down')}
                  disabled={index === categories.length - 1}
                  className={`${styles.moveButton} ${index === categories.length - 1 ? styles.disabled : ''}`}
                  title="Sposta categoria giù"
                >
                  ▼
                </button>

                <span className={styles.toggleText}>
                  {isOpen ? 'Chiudi' : 'Apri'}
                </span>
              </div>
            </div>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  key={`content-${category.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={styles.motionWrapper}
                >
                  <div className={styles.productsContainer}>
                    {categoryProducts.length === 0 ? (
                      <p className={styles.noProducts}>Nessun prodotto in questa categoria.</p>
                    ) : (
                      categoryProducts.map((product, pIndex) => {
                        const productIngredients = product.ingredientIds 
                          ? ingredients.filter(ing => product.ingredientIds?.includes(ing.id))
                          : [];

                        return (
                          <div key={product.id} className={styles.productCard}>
                            <div className={styles.productInfoWrapper}>
                              {product.image && (
                                <img src={product.image} alt={product.name} className={styles.productImage} />
                              )}
                              <div>
                                <h4 className={styles.productName}>{product.name}</h4>
                                <p className={styles.productDescription}>{product.description}</p>
                                
                                {productIngredients.length > 0 && (
                                  <div className={styles.ingredientsList}>
                                    {productIngredients.map(ing => (
                                      <span 
                                        key={ing.id} 
                                        className={`${styles.ingredientTag} ${ing.isSpecial ? styles.ingredientTagSpecial : styles.ingredientTagNormal}`}
                                      >
                                        {ing.isSpecial ? '⚠️ ' : ''}{ing.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className={styles.productRightSection}>
                              <div className={styles.productReorderButtons}>
                                <button 
                                  onClick={() => reorderProducts(category.slug, pIndex, 'up')}
                                  disabled={pIndex === 0}
                                  className={`${styles.smallMoveButton} ${pIndex === 0 ? styles.disabledSmall : ''}`}
                                  title="Sposta prodotto su"
                                >
                                  ▲
                                </button>
                                <button 
                                  onClick={() => reorderProducts(category.slug, pIndex, 'down')}
                                  disabled={pIndex === categoryProducts.length - 1}
                                  className={`${styles.smallMoveButton} ${pIndex === categoryProducts.length - 1 ? styles.disabledSmall : ''}`}
                                  title="Sposta prodotto giù"
                                >
                                  ▼
                                </button>
                              </div>

                              <span className={styles.productPrice}>
                                € {Number(product.price).toFixed(2)}
                              </span>
                              
                              <button 
                                onClick={() => deleteProduct(product.id)}
                                className={styles.deleteButton}
                                title="Elimina prodotto"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        );
      })}
    </div>
  );
}