// components/client/QuantitySelector.tsx
import React from 'react';
import styles from './ClientHome.module.css';

interface Props {
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
}

export default function QuantitySelector({ quantity, setQuantity }: Props) {
  return (
    <div className={styles.customQuantityBox}>
      <span className={styles.customQuantityLabel}>Quantità:</span>
      <div className={styles.customQuantityControls}>
        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className={styles.customQtyBtn}>-</button>
        <span className={styles.customQtyNumber}>{quantity}</span>
        <button onClick={() => setQuantity(q => q + 1)} className={styles.customQtyBtn}>+</button>
      </div>
    </div>
  );
}