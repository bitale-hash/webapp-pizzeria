//components/admin/settings/CompletedOrdersCleanupCard.tsx

'use client';

import React from 'react';
import styles from './AdminSettings.module.css';

interface Props {
  retentionHours: number;
  setRetentionHours: (val: number) => void;
}

export default function CompletedOrdersCleanupCard({ retentionHours, setRetentionHours }: Props) {
  return (
    <div className={styles.cleanupCardBox}>
      <h3 className={styles.cleanupTitle}>
        🗑️ Pulizia Automatica Ordini Completati
      </h3>
      <p className={styles.cleanupDescription}>
        Imposta dopo quante ore gli ordini completati nello storico dovranno essere eliminati automaticamente dal database per liberare spazio.
      </p>

      <div className={styles.cleanupRow}>
        <label className={styles.cleanupLabel}>
          Tempo di conservazione:
        </label>
        <input 
          type="number"
          min="1"
          max="720"
          value={retentionHours}
          onChange={(e) => setRetentionHours(Number(e.target.value))}
          className={styles.cleanupInput}
        />
        <span className={styles.cleanupUnit}>ore</span>
      </div>
    </div>
  );
}