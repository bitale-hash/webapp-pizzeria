// components/admin/panoramica/CategoryIngredientManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import CategoryTabs from './CategoryTabs';
import CategoryIngredientsList from './CategoryIngredientsList';
import styles from './panoramica.module.css';

interface Category {
  id: number;
  name: string;
  slug: string;
  hasIngredients: boolean;
}

interface Ingredient {
  id: number;
  name: string;
  price: number;
  isSpecial: boolean;
  inStock: boolean;
}

interface CategoryIngredient {
  categoryId: number;
  ingredientId: number;
  quantity: number;
}

export default function CategoryIngredientManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number | string }>({});
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/category-ingredients');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
        setIngredients(data.ingredients);
        if (data.categories.length > 0) {
          setActiveTab(data.categories[0].id);
        }

        const qtyMap: { [key: string]: number } = {};
        data.categoryIngredients.forEach((ci: CategoryIngredient) => {
          qtyMap[`${ci.categoryId}-${ci.ingredientId}`] = ci.quantity;
        });
        setQuantities(qtyMap);
      }
    } catch (error) {
      console.error("Errore nel caricamento delle grammature:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (categoryId: number, ingredientId: number, value: string) => {
    setQuantities(prev => ({
      ...prev,
      [`${categoryId}-${ingredientId}`]: value
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setMessage('');

    try {
      const items = Object.entries(quantities).map(([key, qty]) => {
        const [categoryId, ingredientId] = key.split('-');
        return {
          categoryId: Number(categoryId),
          ingredientId: Number(ingredientId),
          quantity: qty === '' ? 0 : Number(qty)
        };
      });

      const res = await fetch('/api/category-ingredients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Modifiche salvate con successo!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Errore durante il salvataggio.');
      }
    } catch (error) {
      console.error("Errore di rete:", error);
      setMessage('Errore di connessione.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.noDataText}>Caricamento in corso...</div>;
  }

  const activeCategory = categories.find(c => c.id === activeTab);

  return (
    <section className={styles.categoryManagerSection}>
      
      {/* Header principale */}
      <div className={styles.categoryManagerHeader}>
        <h2 className={styles.categoryManagerTitle}>
          ⚖️ Gestione Grammature Categorie
        </h2>
        
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className={styles.saveButton}
        >
          {saving ? 'Salvataggio...' : '💾 Salva Modifiche'}
        </button>
      </div>

      {message && (
        <div className={message.includes('successo') ? styles.messageBoxSuccess : styles.messageBoxError}>
          {message}
        </div>
      )}

      {categories.length === 0 ? (
        <p className={styles.noDataText}>Nessuna categoria trovata con la gestione ingredienti attiva.</p>
      ) : (
        <div className={styles.flexColumnGap}>
          
          {/* Selettore Categorie (Tabs) */}
          <CategoryTabs 
            categories={categories}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
          />

          {/* Lista degli ingredienti per la categoria attiva */}
          {activeCategory && (
            <CategoryIngredientsList 
              activeCategory={activeCategory}
              ingredients={ingredients}
              quantities={quantities}
              onQuantityChange={handleQuantityChange}
            />
          )}

        </div>
      )}
    </section>
  );
}