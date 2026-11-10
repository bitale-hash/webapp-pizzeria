import React from 'react';
import styles from './Pizzaiolo.module.css';

interface Props {
  isOpen: boolean;
  targetStatus: 'baking' | 'ready' |'delivering'| 'completed' | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function OrderStatusModal({ isOpen, targetStatus, onClose, onConfirm }: Props) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <h3 className={styles.modalTitleText}>
          {targetStatus === 'baking' ? '🔥 Infornare Ordine?' : '✅ Ordine Pronto?'}
        </h3>
        <p className={styles.modalDescText}>
          {targetStatus === 'baking' 
            ? 'Confermi che le pizze sono nel forno?' 
            : 'Confermi che l\'ordine è pronto per il ritiro e da inviare allo storico?'}
        </p>
        <div className={styles.modalButtonsRow}>
          <button onClick={onClose} className={styles.modalCancelBtn}>
            Annulla
          </button>
          <button 
            onClick={onConfirm}
            className={`${styles.modalConfirmBtn} ${targetStatus === 'baking' ? styles.btnBaking : styles.btnReady}`}
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  );
}