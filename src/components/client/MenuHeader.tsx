import React from 'react';
import styles from './ClientHome.module.css';

interface MenuHeaderProps {
  title: string;
  subtitle: string;
  totalCartItemsCount: number;
  onOpenCart: () => void;
  cartButtonText?: string;
}

export default function MenuHeader({
  title,
  subtitle,
  totalCartItemsCount,
  onOpenCart,
  cartButtonText = 'Carrello'
}: MenuHeaderProps) {
  return (
    <div className={styles.headerFlex}>
      <div>
        <h1 className={styles.title}>
          <br />
          {title}
        </h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      <button onClick={onOpenCart} className={styles.cartButton}>
        <span className={styles.cartIcon}>🛒</span>
        <span>{cartButtonText}</span>
        {totalCartItemsCount > 0 && (
          <span className={styles.cartBadge}>{totalCartItemsCount}</span>
        )}
      </button>
    </div>
  );
}