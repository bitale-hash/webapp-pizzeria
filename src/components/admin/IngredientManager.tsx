//components/admin/IngredientManager.tsx
'use client';

import React, { useState } from 'react';
import { usePizzeria } from '../../context/PizzeriaContext';
import ConfirmModal from '../ConfirmModal'; 
import styles from './IngredientManager.module.css';

export default function IngredientManager() {
  const { ingredients, addIngredient, deleteIngredient, reorderProducts, fetchMenu } = usePizzeria();
  
  const [newIngName, setNewIngName] = useState('');
  const [newIngPrice, setNewIngPrice] = useState('');
  const [newIngPricePerKg, setNewIngPricePerKg] = useState(''); // <-- Stato per il prezzo al kg
  const [newIngIsSpecial, setNewIngIsSpecial] = useState(false);

  // Stato per gestire il modale di conferma eliminazione
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    itemsList: [] as string[],
    onConfirm: () => {},
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName || !newIngPrice) return;

    // Passiamo anche il prezzo al kg alla funzione del context/store
    addIngredient(
      newIngName, 
      parseFloat(newIngPrice), 
      parseFloat(newIngPricePerKg) || 0, 
      newIngIsSpecial
    );
    
    setNewIngName('');
    setNewIngPrice('');
    setNewIngPricePerKg('');
    setNewIngIsSpecial(false);
  };

  // Funzione intercettata prima di eliminare l'ingrediente
 
  const handleOpenDeleteModal = async (ing: { id: number; name: string }) => {
    try {
      const res = await fetch(`/api/ingredients/${ing.id}/affected-products`);
      const data = await res.json();
      
      console.log("Risposta API affected-products:", data); // Controlla la console del browser per verificarla

      // Gestiamo entrambe le possibili strutture di risposta (data.products o data.data)
      const affectedProducts = data.products || data.data || []; 

      // Messaggio chiaro che avvisa della cancellazione dei prodotti collegati
      const message = affectedProducts.length > 0
        ? `ATTENZIONE: Eliminando l'ingrediente "${ing.name}", eliminerai interamente anche i seguenti prodotti collegati:`
        : `Sei sicuro di voler eliminare l'ingrediente "${ing.name}"?`;

      setModalConfig({
        isOpen: true,
        title: 'Conferma eliminazione',
        message: message,
        itemsList: affectedProducts,
        onConfirm: () => executeDelete(ing.id),
      });
    } catch (error) {
      console.error("Errore nel recupero dei prodotti collegati:", error);
      setModalConfig({
        isOpen: true,
        title: 'Conferma eliminazione',
        message: `ATTENZIONE: Eliminando l'ingrediente "${ing.name}", eliminerai interamente anche i prodotti collegati.`,
        itemsList: [],
        onConfirm: () => executeDelete(ing.id),
      });
    }
  };

  // Esecuzione effettiva dell'eliminazione
  const executeDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      await deleteIngredient(id);
      fetchMenu();
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      console.error("Errore durante l'eliminazione", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Gestione Ingredienti</h2>
      <form onSubmit={handleCreateIngredient} className={styles.form}>
        <input 
          type="text" 
          placeholder="Nome Ingrediente" 
          value={newIngName} 
          onChange={e => setNewIngName(e.target.value)}
          className={styles.input}
          required
        />
        <input 
          type="number" 
          step="0.05"
          placeholder="Prezzo Extra (€)" 
          value={newIngPrice} 
          onChange={e => setNewIngPrice(e.target.value)}
          className={styles.input}
          required
        />
        <input 
          type="number" 
          step="0.10"
          placeholder="Prezzo al Kg (€ / kg)" 
          value={newIngPricePerKg} 
          onChange={e => setNewIngPricePerKg(e.target.value)}
          className={styles.input}
        />

        <label className={styles.checkboxLabel}>
          <input 
            type="checkbox" 
            checked={newIngIsSpecial} 
            onChange={e => setNewIngIsSpecial(e.target.checked)}
            className={styles.checkboxInput}
          />
          ⚠️ Ingrediente Speciale / Allergene
        </label>

        <button type="submit" className={styles.submitButton}>
          Aggiungi Ingrediente 📦
        </button>
      </form>

      <div className={styles.ingredientsListContainer}>
        {ingredients.map((ing: any) => (
          <div 
            key={ing.id} 
            className={`${styles.ingredientItem} ${ing.isSpecial ? styles.ingredientItemSpecial : styles.ingredientItemNormal}`}
          >
            <span className={styles.ingredientText}>
              <strong>{ing.name}</strong> 
              {` (€ ${Number(ing.price).toFixed(2)})`}
              {ing.pricePerKg > 0 && ` | Al Kg: € ${Number(ing.pricePerKg).toFixed(2)}`}
              {ing.isSpecial && ' ⚠️ [Speciale/Allergene]'}
            </span>
            <div className={styles.ingredientActions}>
              <button 
                type="button"
                onClick={() => handleOpenDeleteModal(ing)}
                className={styles.deleteButton}
                title="Elimina ingrediente"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Integrazione del ConfirmModal centralizzato */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        itemsList={modalConfig.itemsList}
        isLoading={isDeleting}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        variant="danger"
      />
    </div>
  );
}