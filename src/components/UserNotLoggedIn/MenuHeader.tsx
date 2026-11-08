import React from 'react';
import styles from './UserNotLoggedIn.module.css';

interface MenuHeaderProps {
  totalCartItemsCount: number;
  onOpenCart: () => void;
}

export default function MenuHeader({ totalCartItemsCount, onOpenCart }: MenuHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>Il Nostro Menu</h1>
        <p className={styles.subtitle}>Scegli tra le nostre specialità e componi il tuo carrello</p>
      </div>

      <button onClick={onOpenCart} className={styles.cartButton}>
        <span className={styles.cartIcon}>🛒</span>
        <span>Carrello</span>
        {totalCartItemsCount > 0 && (
          <span className={styles.cartBadge}>{totalCartItemsCount}</span>
        )}
      </button>
    </div>
  );
}