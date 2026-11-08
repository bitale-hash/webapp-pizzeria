//gestore/panoramica/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

import styles from '../page.module.css'

import CategoryIngredientManager from '../../../components/gestore/Panoramica/CategoryIngredientManager';
import IngredientControlSection from '../../../components/gestore/Panoramica/IngredientControlSection'; 
import SalesTopList from '@/src/components/gestore/Panoramica/SalesTopList';
import FinancialSummary from '@/src/components/gestore/Panoramica/FinancialSummary';
import IngredientConsumptionSection from '@/src/components/gestore/Panoramica/IngredientConsumptionSection';
import CalendarManager from '@/src/components/gestore/Panoramica/CalendarManager';

interface Ingredient {
  id: number;
  name: string;
  price: number;
  isSpecial: boolean;
  inStock: boolean;
}

export default function PanoramicaPage() {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/ingredients')
      .then(res => res.json())
      .then(data => {
        const rawList = Array.isArray(data) ? data : (data.ingredients || data.data || []);
        if (Array.isArray(rawList)) {
          const formatted = rawList.map((ing: any) => ({
            ...ing,
            inStock: ing.inStock ?? ing.in_stock ?? true,
          }));
          setIngredients(formatted);
        }
      })
      .catch(err => console.error('Errore caricamento ingredienti:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleStock = async (id: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setUpdatingId(id);

    try {
      const res = await fetch(`/api/ingredients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: newStatus, in_stock: newStatus }),
      });

      if (res.ok) {
        setIngredients(prev =>
          prev.map(ing => (ing.id === id ? { ...ing, inStock: newStatus } : ing))
        );
      } else {
        alert("Errore durante l'aggiornamento dello stock.");
      }
    } catch (error) {
      console.error(error);
      alert('Errore di connessione.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (user?.role !== 'gestore' && user?.role !== 'admin') {
    return (
      <div className={styles.div2}>
        <h1>🚫 Accesso Negato</h1>
        <p>Devi essere un gestore per visualizzare questa pagina.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.div2}>
        <h2>Caricamento Panoramica Operativa... 🍕</h2>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      
      {/* GRIGLIA PRINCIPALE A 2 COLONNE */}
      <div className={styles.div}>
        
        {/* COLONNA SU-SINISTRA: Componente Controllo Ingredienti */}
        <IngredientControlSection 
          ingredients={ingredients}
          updatingId={updatingId}
          onToggleStock={handleToggleStock}
        />

        {/* COLONNA SU-DESTRA: Gestione Grammature Categorie */}
        <CategoryIngredientManager />

        {/* COLONNA CENTRALE-SINISTRA: Componente Top Sales */}
        <SalesTopList/>
        {/* COLONNA CENTRALE-DESTRA: Riepilogo Finanziario */}
        <FinancialSummary/>
        {/* COLONNA GIU: Componente Top Sales */}
        <IngredientConsumptionSection />
        <CalendarManager/>
      </div>
    </main>
  );
}