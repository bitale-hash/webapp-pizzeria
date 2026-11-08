// components/client/ProductCustomizationModal.tsx
'use client';

import React from 'react';
import { MenuItem } from '../../context/PizzeriaContext';
import CustomizationExtrasList from './CustomizationExtrasList';
import QuantitySelector from './QuantitySelector';
import styles from './ClientHome.module.css';

interface Extra {
  id: number;
  name: string;
  price: number;
}

interface Props {
  selectedProduct: MenuItem;
  notes: string;
  setNotes: (v: string) => void;
  availableExtras: Extra[];
  selectedExtras: Extra[];
  handleToggleExtra: (extra: Extra) => void;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ProductCustomizationModal({
  selectedProduct, notes, setNotes, availableExtras, selectedExtras,
  handleToggleExtra, quantity, setQuantity, onClose, onConfirm
}: Props) {
  const extrasTotal = selectedExtras.reduce((sum, item) => sum + item.price, 0);
  const currentItemTotal = (Number(selectedProduct.price) + extrasTotal) * quantity;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.customModalCard}>
        
        {/* Header con titolo e pulsante di chiusura */}
        <div className={styles.customModalHeader}>
          <div>
            <h2 className={styles.customModalTitle}>
              🍕 {selectedProduct.name}
            </h2>
            <p className={styles.customModalBasePrice}>
              Prezzo base: € {Number(selectedProduct.price).toFixed(2)}
            </p>
          </div>
          <button onClick={onClose} className={styles.customCloseButton}>
            ✕
          </button>
        </div>

        {/* Note per la cucina */}
        <div className={styles.customSection}>
          <label className={styles.customLabel}>
            📝 Note speciali per la cucina:
          </label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Es. Ben cotta, senza origano, impasto ben lievitato..."
            className={styles.customTextarea}
            rows={2}
          />
        </div>

        {/* Lista degli ingredienti extra */}
        <CustomizationExtrasList 
          availableExtras={availableExtras}
          selectedExtras={selectedExtras}
          onToggleExtra={handleToggleExtra}
        />

        {/* Selezione quantità */}
        <QuantitySelector 
          quantity={quantity}
          setQuantity={setQuantity}
        />

        {/* Pulsanti d'azione */}
        <div className={styles.customActionButtonsRow}>
          <button onClick={onClose} className={styles.customSecondaryButton}>
            Annulla
          </button>
          <button onClick={onConfirm} className={styles.customPrimaryButton}>
            <span>Aggiungi 🛒</span>
            <span>€ {currentItemTotal.toFixed(2)}</span>
          </button>
        </div>

      </div>
    </div>
  );
}