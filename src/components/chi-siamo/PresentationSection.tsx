import React from 'react';
import styles from './chi-siamo.module.css';

export default function PresentationSection({ generalData }: { generalData: any }) {
  return (
    <section className={styles.presentationSection}>
      <div className={styles.presentationHeader}>
        <h1 className={styles.presentationTitle}>{generalData.title}</h1>
        <p className={styles.presentationSubtitle}>{generalData.subtitle}</p>
      </div>

      <div className={styles.presentationGrid}>
        <div className={styles.imageWrapper}>
          {generalData.presentationImage ? (
            <img src={generalData.presentationImage} alt="Locale" className={styles.presentationImage} />
          ) : (
            <div className={styles.imagePlaceholder}>Nessuna immagine</div>
          )}
        </div>
        <div className={styles.presentationContent}>
          <h2>{generalData.restaurantName}</h2>
          <p>{generalData.description}</p>
        </div>
      </div>
    </section>
  );
}