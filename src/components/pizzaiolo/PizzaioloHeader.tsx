import React from 'react';
import styles from './Pizzaiolo.module.css';

interface Props {
  activeCount: number;
  completedCount: number;
  showHistory: boolean;
  setShowHistory: (v: boolean) => void;
  onDelayAll: () => void;
}

export default function PizzaioloHeader({ activeCount, completedCount, showHistory, setShowHistory, onDelayAll }: Props) {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>🍕 KDS Cucina - Gestione Ordini</h1>
      <div className={styles.headerActions}>
        <span className={styles.badge}>
          Attivi: {activeCount}
        </span>
        <span className={`${styles.badge} ${styles.badgeCompleted}`}>
          Completati: {completedCount}
        </span>
        
        <button onClick={onDelayAll} className={styles.delayAllButton}>
          ⏱️ +15 min (Tutti)
        </button>

        <button onClick={() => setShowHistory(!showHistory)} className={styles.historyButton}>
          {showHistory ? 'Visualizza Attivi 📋' : 'Storico Completati 📜'}
        </button>
      </div>
    </div>
  );
}