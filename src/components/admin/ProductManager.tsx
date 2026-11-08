'use client';

import React, { useState, useRef } from 'react';
import { usePizzeria } from '../../context/PizzeriaContext';
import styles from './ProductManager.module.css';

export default function ProductManager() {
  const { categories, ingredients, addProduct, fetchMenu } = usePizzeria();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newProductName, setNewProductName] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductImageFile, setNewProductImageFile] = useState<File | null>(null);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<number[]>([]);
  const [newProductCategory, setNewProductCategory] = useState('');

  const selectedCategoryObj = categories.find(cat => cat.slug === newProductCategory);
  const categoryHasIngredients = selectedCategoryObj ? Boolean(selectedCategoryObj.hasIngredients) : false;

  const handleToggleProductIngredient = (id: number) => {
    setSelectedIngredientIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice || !newProductCategory) return;

    addProduct({
      category: newProductCategory,
      name: newProductName,
      description: newProductDesc,
      price: parseFloat(newProductPrice),
      imageFile: newProductImageFile,
      ingredientIds: selectedIngredientIds,
    });

    setNewProductName('');
    setNewProductDesc('');
    setNewProductPrice('');
    setNewProductImageFile(null);
    setSelectedIngredientIds([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    fetchMenu();
  };
  
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Aggiungi Prodotto</h2>
      <form onSubmit={handleCreateProduct} className={styles.form}>
        
        <select 
          value={newProductCategory} 
          onChange={e => {
            setNewProductCategory(e.target.value);
            setSelectedIngredientIds([]);
          }}
          className={styles.select}
          required
        >  
          <option value="" disabled>Seleziona Categoria</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.slug}>
              {cat.name} {cat.hasIngredients ? '🍕' : '🥤'}
            </option>
          ))}
        </select>

        <input 
          type="text" 
          placeholder="Nome Prodotto (es. Margherita)" 
          value={newProductName} 
          onChange={e => setNewProductName(e.target.value)}
          className={styles.input}
          required
        />

        <input 
          type="text" 
          placeholder="Descrizione" 
          value={newProductDesc} 
          onChange={e => setNewProductDesc(e.target.value)}
          className={styles.input}
        />

        <input 
          type="number" 
          step="0.10"
          placeholder="Prezzo (€)" 
          value={newProductPrice} 
          onChange={e => setNewProductPrice(e.target.value)}
          className={styles.input}
          required
        />

        <label className={styles.label}>
          Foto Prodotto (opzionale):
        </label>
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={e => {
            if (e.target.files && e.target.files[0]) {
              setNewProductImageFile(e.target.files[0]);
            }
          }}
          className={styles.fileInput}
        />

        {/* Blocco ingredienti interni sempre visibile */}
        <div style={{ opacity: categoryHasIngredients ? 1 : 0.4, pointerEvents: categoryHasIngredients ? 'auto' : 'none', transition: 'opacity 0.2s ease' }}>
          <label className={styles.ingredientsLabel}>
            {!categoryHasIngredients ? "Non disponibile per questa categoria" : "Seleziona ingredienti interni"}
          </label>
          <div className={styles.ingredientsList}>
            {ingredients.map(ing => {
              const isSelected = selectedIngredientIds.includes(ing.id);
              return (
                <div 
                  key={ing.id} 
                  onClick={() => handleToggleProductIngredient(ing.id)}
                  className={`
                    ${styles.ingredientItem} 
                    ${isSelected ? styles.ingredientSelected : ''} 
                    ${ing.isSpecial ? styles.ingredientSpecial : ''}
                  `}
                >
                  <span className={styles.ingredientText}>
                    {isSelected ? '✅ ' : '⬜ '} {ing.name} (€ {Number(ing.price).toFixed(2)}) 
                    {ing.isSpecial && <span className={styles.specialBadge}>⚠️ [Speciale]</span>}
                  </span>
                  <span className={ing.inStock ? styles.inStock : styles.outOfStock}>
                    {ing.inStock ? 'Disponibile' : 'Esaurito'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>
          Crea Prodotto ➕
        </button>

      </form>
    </div>
  );
}