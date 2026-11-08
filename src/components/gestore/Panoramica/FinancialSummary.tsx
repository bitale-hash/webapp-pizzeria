// components/gestore/Panoramica/FinancialSummary.tsx
'use client';

import React, { useState, useEffect } from 'react';
import PeriodSelector from './sub-components/PeriodSelector';

import styles from './panoramica.module.css';
import SectionLoader from './sub-components/SectionLoader';

interface SummaryData {
  totalRevenue: number;
  totalEstimatedCost: number;
  netProfit: number;
  totalOrders: number;
}

export default function FinancialSummary() {
  const [period, setPeriod] = useState('1month');
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData(period);
  }, [period]);

  const fetchFinancialData = async (selectedPeriod: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/stats/financial-summary?period=${selectedPeriod}&t=${Date.now()}`);
      const json = await res.json();
      if (json.success) {
        setData(json.summary);
      }
    } catch (error) {
      console.error("Errore caricamento riepilogo finanziario:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.categoryManagerSection}>
      <div className={styles.categoryManagerHeader}>
        <h2 className={styles.categoryManagerTitle}>
          📊 Riepilogo Finanziario & Margini
        </h2>
        <span className={styles.badgeCount}>
          {data ? `${data.totalOrders} Ordini` : 'Bilancio'}
        </span>
      </div>

      {/* Sotto-componente Selettore Periodo */}
      <PeriodSelector selectedPeriod={period} onSelectPeriod={setPeriod} />

      {loading ? (
        <SectionLoader message="Calcolo dati finanziari..." />
      ) : !data ? (
        <p className={styles.noDataText}>Nessun dato disponibile per il periodo selezionato.</p>
      ) : (
        <div className={styles.financialGrid}>
          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Incasso Totale</span>
            <span className={`${styles.metricValue} ${styles.metricValueRevenue}`}>
              € {data.totalRevenue.toFixed(2)}
            </span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Costi Stimati (Ingredienti)</span>
            <span className={`${styles.metricValue} ${styles.metricValueCost}`}>
              € {data.totalEstimatedCost.toFixed(2)}
            </span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricTitle}>Utile Netto Stimato</span>
            <span className={`${styles.metricValue} ${styles.metricValueProfit}`}>
              € {data.netProfit.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}