// components/client/CustomizationExtrasList.tsx
import React from 'react';
import styles from './ClientHome.module.css';

interface Extra {
  id: number;
  name: string;
  price: number;
}

interface Props {
  availableExtras: Extra[];
  selectedExtras: Extra[];
  onToggleExtra: (extra: Extra) => void;
}

export default function CustomizationExtrasList({ availableExtras, selectedExtras, onToggleExtra }: Props) {
  if (availableExtras.length === 0) return null;

  return (
    <div className={styles.customSection}>
      <label className={styles.customLabel}>
        ➕ Aggiungi Extra / Modifiche:
      </label>
      <div className={styles.customExtrasScrollContainer}>
        {availableExtras.map(extra => {
          const isSelected = selectedExtras.some(e => e.name === extra.name);
          return (
            <div 
              key={extra.name}
              onClick={() => onToggleExtra(extra)}
              className={`${styles.customExtraItem} ${isSelected ? styles.customExtraSelected : styles.customExtraNormal}`}
            >
              <span className={styles.customExtraNameText}>
                <span className={styles.customBulletIndicator}>
                  {isSelected ? '●' : '○'}
                </span> {extra.name}
              </span>
              <span className={styles.customExtraPriceText}>
                + € {extra.price.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}