// components/gestore/Panoramica/sub-components/SectionLoader.tsx
import React from 'react';
import styles from '../panoramica.module.css';

interface SectionLoaderProps {
  message?: string;
}

export default function SectionLoader({ message = 'Caricamento in corso...' }: SectionLoaderProps) {
  return (
    <div className={`${styles.loadingContainer} ${styles.loadingContainerCustom}`}>
      <div className={styles.spinner}></div>
      <p>{message}</p>
    </div>
  );
}