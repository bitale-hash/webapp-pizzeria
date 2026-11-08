'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
 
export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string; 
  categoryId?: number;
  ingredientIds?: number[]; 
 
}

export interface Ingredient {
  id: number;
  name: string;
  price: number;
  pricePerKg: number;  
  inStock: boolean;
  isSpecial: boolean; 
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  hasIngredients: boolean;
  departmentId?: number | null;
}

interface PizzeriaContextType {
  menu: MenuItem[];
  ingredients: Ingredient[];
  categories: Category[];
  departments: any[];  
  fetchMenu: () => Promise<void>;
  addProduct: (product: {
    category: string;
    name: string;
    description: string;
    price: number;
    imageFile?: File | null;
    ingredientIds: number[];
  }) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  toggleIngredientStock: (id: number) => Promise<void>;
  addIngredient: (name: string, price: number, pricePerKg: number, isSpecial: boolean) => Promise<void>; 
  deleteIngredient: (id: number) => Promise<void>;
  addCategory: (name: string, hasIngredients: boolean, departmentId?: number | null) => Promise<void>; 
  updateCategory: (id: number, name: string, hasIngredients: boolean, departmentId?: number | null) => Promise<void>; 
  deleteCategory: (id: number) => Promise<void>;
  isProductAvailable: (product: MenuItem) => boolean;
  reorderCategories: (newCategories: Category[]) => Promise<void>;
  reorderProducts: (categorySlug: string, index: number, direction: 'up' | 'down') => Promise<void>;
}

const PizzeriaContext = createContext<PizzeriaContextType | undefined>(undefined);

export const PizzeriaProvider = ({ children }: { children: React.ReactNode }) => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<any[]>([]); // 👈 Stato per i reparti
  
  useEffect(() => {
    fetchMenu();
    fetchIngredients();
    fetchCategories();
    fetchDepartments(); // 👈 Caricamento dei reparti all'avvio
  }, []);

  const getData = async (url: string) => {
    const res = await fetch(url);
    const text = await res.text();
    return text ? JSON.parse(text) : { success: false, data: [] };
  };

  const fetchMenu = async () => {
    const data = await getData('/api/products');
    if (data.success) {
      const formattedMenu = data.data.map((prod: any) => ({
        id: prod.id,
        name: prod.name,
        description: prod.description,
        price: prod.price,
        image: prod.image_url, 
        category: prod.category.slug,  
        ingredientIds: prod.ingredients?.map((i: any) => i.ingredientId) || []
      }));
      setMenu(formattedMenu);
    }
  };

  const fetchIngredients = async () => {
    const data = await getData('/api/ingredients');
    if (data.success) {
      const formattedIngredients = data.data.map((ing: any) => ({
        ...ing,
        isSpecial: !!ing.isSpecial
      }));
      setIngredients(formattedIngredients);
    }
  };

  const fetchCategories = async () => {
    const data = await getData('/api/categories');
    if (data.success) setCategories(data.data);
  };

  // 🚀 Funzione per recuperare i reparti dal database
  const fetchDepartments = async () => {
    const data = await getData('/api/departments');
    if (data.success) {
      setDepartments(data.departments || data.data || []);
    }
  };

  const postData = async (url: string, body: any, isFormData = false) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
      body: isFormData ? body : JSON.stringify(body),
    });
    const text = await res.text();
    return text ? JSON.parse(text) : { success: true };
  };

  const addProduct = async (product: {
    category: string;
    name: string;
    description: string;
    price: number;
    imageFile?: File | null;
    ingredientIds: number[];
  }) => {
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('price', String(product.price));
    formData.append('categorySlug', product.category);
    if (product.imageFile) formData.append('image', product.imageFile);
    product.ingredientIds?.forEach(id => formData.append('ingredientIds', String(id)));

    const result = await postData('/api/products', formData, true);
    if (result.success) {
      setMenu(prev => [...prev, {
        id: result.data.id,
        name: result.data.name,
        description: result.data.description,
        price: result.data.price,
        image: result.data.image_url, 
        category: result.data.category.slug,
        ingredientIds: result.data.ingredients?.map((i: any) => i.ingredientId) || []
      }]);
    }
  };

  const addIngredient = async (name: string, price: number, pricePerKg: number, isSpecial: boolean) => {
    const data = await postData('/api/ingredients', { name, price, pricePerKg, isSpecial });
    if (data.success) {
      setIngredients(prev => [...prev, { ...data.data, isSpecial: !!data.data.isSpecial }]);
    }
  };

  const addCategory = async (name: string, hasIngredients: boolean, departmentId?: number | null) => {
    const data = await postData('/api/categories', { name, hasIngredients, departmentId });
    if (data.success) setCategories(prev => [...prev, data.data]);
  };

  const deleteData = async (url: string) => {
    const res = await fetch(url, { method: 'DELETE' });
    const text = await res.text();
    return text ? JSON.parse(text) : { success: true };
  };

  const deleteCategory = async (id: number) => {
    const data = await deleteData(`/api/categories/${id}`);
    if (data.success) {
      setCategories(prev => prev.filter(cat => cat.id !== id));
      await fetchMenu();
    }
  };

  const deleteIngredient = async (id: number) => {
    const data = await deleteData(`/api/ingredients/${id}`);
    if (data.success) setIngredients(prev => prev.filter(ing => ing.id !== id));
  };

  const deleteProduct = async (id: number) => {
    const result = await deleteData(`/api/products/${id}`);
    if (result.success) setMenu(prev => prev.filter(item => item.id !== id));
  };

  const putData = async (url: string, body: any) => {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    return text ? JSON.parse(text) : { success: true };
  };

  const toggleIngredientStock = async (id: number) => {
    const ingredient = ingredients.find(i => i.id === id);
    if (!ingredient) return;

    const newStockStatus = !ingredient.inStock;

    const result = await putData(`/api/ingredients/${id}`, { 
      inStock: newStockStatus 
    });

    if (result.success) {
      setIngredients(prev => prev.map(ing => ing.id === id ? { ...ing, inStock: newStockStatus } : ing));
    } else {
      console.error("❌ Errore durante l'aggiornamento dello stock sul server.");
    }
  };

  const updateCategory = async (id: number, name: string, hasIngredients: boolean, departmentId?: number | null) => {
    const data = await putData(`/api/categories/${id}`, { 
      name, 
      hasIngredients, 
      departmentId: departmentId ?? null 
    });
    
    if (data.success) {
      setCategories(prev => prev.map(cat => cat.id === id ? data.data : cat));
    }
  };

  const reorderCategories = async (newCategories: Category[]) => {
    setCategories(newCategories);
    try {
      const itemsPayload = newCategories.map((cat, idx) => ({ id: cat.id, position: idx }));
      await fetch('/api/categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsPayload }),
      });
    } catch (error) {
      console.error('Errore salvataggio categorie:', error);
    }
  };

  const reorderProducts = async (categorySlug: string, index: number, direction: 'up' | 'down') => {
    const catProducts = menu.filter(p => p.category === categorySlug);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= catProducts.length) return;

    const updatedCatProducts = [...catProducts];
    const temp = updatedCatProducts[index];
    updatedCatProducts[index] = updatedCatProducts[targetIndex];
    updatedCatProducts[targetIndex] = temp;

    let catIndex = 0;
    const newMenu = menu.map(prod => {
      if (prod.category === categorySlug) {
        const p = updatedCatProducts[catIndex];
        catIndex++;
        return p;
      }
      return prod;
    });

    setMenu(newMenu);

    try {
      const itemsPayload = updatedCatProducts.map((p, idx) => ({ id: p.id, position: idx }));
      const response = await fetch('/api/products/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsPayload }),
      });

      if (!response.ok) {
        throw new Error('Errore nel salvataggio del database');
      }
    } catch (error) {
      console.error('Errore salvataggio prodotti:', error);
      fetchMenu();
    }
  };

  const isProductAvailable = (product: MenuItem): boolean => {
    if (!product.ingredientIds || product.ingredientIds.length === 0) return true;
    return product.ingredientIds.every(ingId => {
      const ingredient = ingredients.find(i => i.id === ingId);
      return ingredient ? ingredient.inStock : true;
    });
  };
  
  return (
    <PizzeriaContext.Provider value={{ 
      menu,  
      fetchMenu,
      addProduct, 
      deleteProduct, 
      reorderProducts,
      ingredients,      
      toggleIngredientStock, 
      addIngredient, 
      deleteIngredient,
      categories,
      addCategory,      
      updateCategory,   
      deleteCategory,
      reorderCategories,
      isProductAvailable,
      departments
    }}>
      {children}
    </PizzeriaContext.Provider>
  );
};

export const usePizzeria = () => {
  const context = useContext(PizzeriaContext);
  if (!context) {
    throw new Error('usePizzeria deve essere usato all\'interno di un PizzeriaProvider');
  }
  return context;
};