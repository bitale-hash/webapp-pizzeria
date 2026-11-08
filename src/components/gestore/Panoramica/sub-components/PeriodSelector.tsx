// components/gestore/Panoramica/PeriodSelector.tsx
import React from 'react';
import styles from '../panoramica.module.css';

interface PeriodSelectorProps {
  selectedPeriod: string;
  onSelectPeriod: (period: string) => void;
}

export default function PeriodSelector({ selectedPeriod, onSelectPeriod }: PeriodSelectorProps) {
  const periods = [
    { id: '1month', label: 'Ultimo Mese' },
    { id: '3months', label: 'Ultimi 3 Mesi' },
    { id: '6months', label: 'Ultimi 6 Mesi' },
    { id: 'year', label: 'Ultimo Anno' },
  ];

  return (
    <div className={styles.periodSelectorContainer}>
      {periods.map(p => (
        <button
          key={p.id}
          onClick={() => onSelectPeriod(p.id)}
          className={`${styles.periodTabBtn} ${selectedPeriod === p.id ? styles.periodTabBtnActive : ''}`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}