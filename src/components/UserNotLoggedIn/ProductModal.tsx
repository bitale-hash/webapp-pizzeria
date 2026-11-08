import React from 'react';
import { MenuItem } from '../../context/PizzeriaContext';
import styles from './UserNotLoggedIn.module.css';

interface Extra {
  id: number;
  name: string;
  price: number;
}

interface ProductModalProps {
  product: MenuItem;
  notes: string;
  setNotes: (notes: string) => void;
  availableExtras: Extra[];
  selectedExtras: Extra[];
  onToggleExtra: (extra: Extra) => void;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ProductModal({
  product,
  notes,
  setNotes,
  availableExtras,
  selectedExtras,
  onToggleExtra,
  quantity,
  setQuantity,
  onClose,
  onConfirm
}: ProductModalProps) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.customModalCard}>
        <div className={styles.customModalHeader}>
          <h2 className={styles.customModalTitle}>Personalizza {product.name}</h2>
          <button onClick={onClose} className={styles.customCloseButton}>✕</button>
        </div>

        <p className={styles.modalBasePrice}>
          Base: € {Number(product.price).toFixed(2)}
        </p>

        <div className={styles.modalSectionSpacing}>
          <label className={styles.customLabel}>Note per la cucina:</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Es. Senza cipolla, ben cotta..."
            className={styles.customTextarea}
          />
        </div>

        <div className={styles.modalSectionSpacing}>
          <label className={styles.customLabel}>Ingredienti Aggiuntivi:</label>
          <div className={styles.customExtrasScrollContainer}>
            {availableExtras.map(extra => {
              const isSelected = selectedExtras.some(e => e.name === extra.name);
              
              // Gestione delle proprietà dinamiche tramite variabili CSS custom
              const extraStyle = {
                '--extra-bg': isSelected ? '#1e293b' : '#020617',
                '--extra-border': isSelected ? '#f97316' : '#1e293b',
              } as React.CSSProperties;

              return (
                <div 
                  key={extra.name}
                  onClick={() => onToggleExtra(extra)}
                  className={styles.extraItemCard}
                  style={extraStyle}
                >
                  <span className={styles.extraNameText}>{extra.name}</span>
                  <span className={styles.productPrice}>+ € {extra.price.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.customQuantityBox}>
          <span className={`${styles.customLabel} ${styles.zeroMargin}`}>Quantità:</span>
          <div className={styles.customQuantityControls}>
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className={styles.customQtyBtn}>-</button>
            <span className={styles.customQtyNumber}>{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)} className={styles.customQtyBtn}>+</button>
          </div>
        </div>

        <div className={styles.customActionButtonsRow}>
          <button onClick={onClose} className={styles.customSecondaryButton}>Annulla</button>
          <button onClick={onConfirm} className={`${styles.customPrimaryButton} ${styles.centerContent}`}>Conferma</button>
        </div>
      </div>
    </div>
  );
}