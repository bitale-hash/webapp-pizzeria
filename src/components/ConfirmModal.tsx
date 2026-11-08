import React from 'react';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemsList?: string[];
  confirmText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  variant?: 'danger' | 'primary';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  itemsList = [],
  confirmText = 'Conferma',
  isLoading = false,
  onConfirm,
  onClose,
  variant = 'primary',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  // Gestione della variabile CSS dinamica per il colore del bottone di conferma
  const confirmBtnStyle = {
    '--confirm-bg': variant === 'danger' ? '#dc2626' : '#2563eb',
  } as React.CSSProperties;

  return (
    <div className={styles.overlay}>
      <div className={styles.modalCard}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>

        {itemsList.length > 0 && (
          <ul className={styles.list}>
            {itemsList.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={styles.cancelBtn}
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={styles.confirmBtn}
            style={confirmBtnStyle}
          >
            {isLoading ? 'Operazione in corso...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}