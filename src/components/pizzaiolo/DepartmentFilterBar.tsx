import React from 'react';
import styles from './Pizzaiolo.module.css';

interface Props {
  departments: any[];
  selectedDepartmentFilter: string | number;
  onSelectFilter: (id: string | number) => void;
}

export default function DepartmentFilterBar({ departments, selectedDepartmentFilter, onSelectFilter }: Props) {
  return (
    <div className={styles.filtersBar}>
      <span className={styles.filterLabel}>Filtra Reparto:</span>
      <button
        onClick={() => onSelectFilter('all')}
        className={`${styles.filterBtn} ${selectedDepartmentFilter === 'all' ? styles.filterBtnActive : ''}`}
      >
        🌐 Tutti i Reparti
      </button>
      {departments.map((dept: any) => (
        <button
          key={dept.id}
          onClick={() => onSelectFilter(dept.id)}
          className={`${styles.filterBtn} ${selectedDepartmentFilter === dept.id ? styles.filterBtnActive : ''}`}
        >
          {dept.fixedTimeMinutes ? '⚡' : '🏭'} {dept.name}
        </button>
      ))}
    </div>
  );
}