// components/gestore/Panoramica/IngredientConsumptionSection.tsx
'use client';

import React, { useEffect, useState } from 'react';
import PeriodSelector from './sub-components/PeriodSelector';
import styles from './panoramica.module.css';

interface IngredientConsumption {
  ingredient_id: number;
  ingredient_name: string;
  totale_grammi_consumati: number;
  price_per_kg: number;
}

export default function IngredientConsumptionSection() {
  const [period, setPeriod] = useState<string>('1month');
  const [data, setData] = useState<IngredientConsumption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConsumption() {
      try {
        setLoading(true);
        const res = await fetch(`/api/stats/ingredient-consumption?period=${period}`);
        const json = await res.json();

        if (json.success) {
          setData(json.consumptions);
        } else {
          setError(json.error || 'Errore nel recupero dei dati di consumo');
        }
      } catch (err: any) {
        setError(err.message || 'Errore di rete');
      } finally {
        setLoading(false);
      }
    }

    fetchConsumption();
  }, [period]);

  return (
    <div className={styles.categoryManagerSection}>
      <div className={styles.categoryManagerHeader}>
        <h3 className={styles.categoryManagerTitle}>
          <span>📊</span> Consumo Ingredienti (Base + Extra)
        </h3>
        <span className={styles.badgeCount}>{data.length} Ingredienti</span>
      </div>

      {/* Sotto-componente Selettore Periodo */}
      <PeriodSelector selectedPeriod={period} onSelectPeriod={setPeriod} />

      {loading ? (
        <div className={`${styles.loadingContainer} ${styles.loadingContainerCustom}`}>
          <div className={styles.spinner}></div>
          <p>Caricamento consumi...</p>
        </div>
      ) : error ? (
        <div className={styles.messageBoxError}>Errore: {error}</div>
      ) : data.length === 0 ? (
        <p className={styles.noDataText}>Nessun consumo registrato per il periodo selezionato.</p>
      ) : (
        <div className={styles.categoryContentBox}>
          {data.map((row) => {
            const totalGrams = Number(row.totale_grammi_consumati || 0);
            const pricePerKg = Number(row.price_per_kg || 0);
            const estimatedCost = (totalGrams / 1000) * pricePerKg;

            return (
              <div key={row.ingredient_id} className={styles.categoryRowItem}>
                <div className={styles.ingredientInfo}>
                  <span className={styles.ingredientMainText}>
                    {row.ingredient_name ? row.ingredient_name.charAt(0).toUpperCase() + row.ingredient_name.slice(1) : 'Ingrediente'}
                  </span>
                  <span className={styles.ingredientPrice}>
                    Prezzo al Kg: € {pricePerKg.toFixed(2)}
                  </span>
                </div>
                
                <div className={styles.consumptionDetailsRow}>
                  <div className={styles.textRight}>
                    <div className={styles.ingredientMainText}>{totalGrams.toLocaleString()} g</div>
                    <div className={styles.unitLabel}>Totale Consumato</div>
                  </div>
                  <div className={styles.textRight}>
                    <div className={styles.revenueText}>€ {estimatedCost.toFixed(2)}</div>
                    <div className={styles.unitLabel}>Costo Stimato</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}