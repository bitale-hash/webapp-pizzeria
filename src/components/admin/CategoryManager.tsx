'use client';

import React, { useState, useEffect } from 'react';
import { usePizzeria } from '../../context/PizzeriaContext';
import styles from './CategoryManager.module.css';

export default function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = usePizzeria();
  
  const [newCatName, setNewCatName] = useState('');
  const [newCatHasIngredients, setNewCatHasIngredients] = useState(false);
  const [newCatDepartmentId, setNewCatDepartmentId] = useState<number | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);

  // Carica i reparti di produzione disponibili per i menu a tendina
  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => {
        if (data.success) setDepartments(data.data);
      })
      .catch(err => console.error('Errore caricamento reparti:', err));
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    await addCategory(newCatName, newCatHasIngredients, newCatDepartmentId);
    
    setNewCatName('');
    setNewCatHasIngredients(false);
    setNewCatDepartmentId(null);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Gestione Categorie</h2>
      
      <form onSubmit={handleCreateCategory} className={styles.form}>
        <input
          type="text"
          placeholder="Nome Categoria (es. Pizze)"
          value={newCatName}
          onChange={e => setNewCatName(e.target.value)}
          className={styles.input}
          required
        />

        {/* Selezione Reparto di Produzione alla creazione */}
        <select
          value={newCatDepartmentId || ''}
          onChange={e => setNewCatDepartmentId(e.target.value ? parseInt(e.target.value) : null)}
          className={styles.input}
        >
          <option value="">-- Seleziona Reparto Produzione (Opzionale) --</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={newCatHasIngredients}
            onChange={e => setNewCatHasIngredients(e.target.checked)}
            className={styles.checkboxInput}
          />
          Ha ingredienti interni (es. Pizze/Panini)
        </label>

        <button type="submit" className={styles.submitButton}>
          Crea Categoria 📁
        </button>
      </form>

      <div className={styles.categoriesListContainer}>
        {categories.map(cat => (
          <div key={cat.id} className={styles.categoryItem} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <span className={styles.categoryText}>
              {cat.name} {cat.hasIngredients ? '🍕' : '🥤'}
            </span>

            {/* Selettore rapido per cambiare reparto alla categoria direttamente nella lista */}
            <select
              value={cat.departmentId ?? ''}
              onChange={e => updateCategory(
                cat.id, 
                cat.name, 
                cat.hasIngredients, 
                e.target.value ? parseInt(e.target.value) : null
              )}
              className={styles.input}
              style={{ width: '220px', padding: '0.3rem' }}
            >
              <option value="">-- Nessun Reparto --</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => deleteCategory(cat.id)}
              className={styles.deleteButton}
              title="Elimina categoria"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}