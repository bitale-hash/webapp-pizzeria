'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import { MenuItem } from '../../context/PizzeriaContext';
import styles from './UserNotLoggedIn.module.css';

interface CategorySectionProps {
  category: { id: number; name: string; slug: string };
  isOpen: boolean;
  categoryProducts: MenuItem[];
  onToggle: (catId: number) => void;
  isProductAvailable: (product: MenuItem) => boolean;
  onProductClick: (product: MenuItem) => void;
}

export default function CategorySection({
  category,
  isOpen,
  categoryProducts,
  onToggle,
  isProductAvailable,
  onProductClick,
}: CategorySectionProps) {
  return (
    <div className={styles.categoryCard}>
      <div onClick={() => onToggle(category.id)} className={styles.categoryHeader}>
        <h2 className={styles.categoryTitle}>
          {category.name} <span className={styles.categoryCount}>({categoryProducts.length})</span>
        </h2>

        <div className={styles.categoryHeaderAction}>
          <span className={styles.categoryToggleText}>{isOpen ? 'Chiudi' : 'Apri'}</span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={styles.categoryChevron}
          >
            ▼
          </motion.span>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={styles.motionOverflowWrapper}
          >
            <div className={styles.categoryBody}>
              {categoryProducts.length === 0 ? (
                <p className={styles.emptyCategoryText}>Nessun prodotto in questa categoria.</p>
              ) : (
                <div className={styles.productsGrid}>
                  {categoryProducts.map(product => (
                    <ProductCard 
                      key={product.id}
                      product={product}
                      available={isProductAvailable(product)}
                      onProductClick={onProductClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}