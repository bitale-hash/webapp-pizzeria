// components/gestore/Panoramica/SalesTopList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import PeriodSelector from './sub-components/PeriodSelector';
import styles from './panoramica.module.css';
import SectionLoader from './sub-components/SectionLoader';

interface TopProduct {
  id: number;
  name: string;
  totalSold: number;
  totalRevenue: number;
}

export default function SalesTopList() {
  const [period, setPeriod] = useState('1month');
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopProducts(period);
  }, [period]);

  const fetchTopProducts = async (selectedPeriod: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/stats/top-products?period=${selectedPeriod}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Errore caricamento top products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.categoryManagerSection}>
      <div className={styles.categoryManagerHeader}>
        <h2 className={styles.categoryManagerTitle}>
          🏆 Top Prodotti Più Venduti
        </h2>
        <span className={styles.badgeCount}>
          Classifica
        </span>
      </div>

      {/* Sotto-componente Selettore Periodo */}
      <PeriodSelector selectedPeriod={period} onSelectPeriod={setPeriod} />

      {loading ? (
        <SectionLoader message="Caricamento statistiche..." />
      ) : products.length === 0 ? (
        <p className={styles.noDataText}>Nessuna vendita registrata in questo periodo.</p>
      ) : (
        <div className={`${styles.ingredientsListContainer} ${styles.topListContainer}`}>
          {products.map((prod, index) => {
            const rowStyle = {
              '--rank-border-color': index === 0 ? '#fbbf24' : '#38bdf8',
            } as React.CSSProperties;

            return (
              <div 
                key={prod.id} 
                className={`${styles.ingredientRow} ${styles.topProductRow}`} 
                style={rowStyle}
              >
                <div className={styles.ingredientInfo}>
                  <span className={styles.ingredientMainText}>
                    {index + 1}. {prod.name}
                  </span>
                  <span className={styles.ingredientPrice}>
                    Venduti: <strong>{prod.totalSold}</strong> pezzi
                  </span>
                </div>
                <div>
                  <span className={styles.revenueText}>
                    € {prod.totalRevenue.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}