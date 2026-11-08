import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePizzeria, MenuItem } from '../context/PizzeriaContext';
import { useCart } from '../context/CartContext';

export function useMenuLogic() {
  const { user } = useAuth();
  const { menu, categories, ingredients, isProductAvailable } = usePizzeria();
  const { cart, addToCart, updateQuantity, removeFromCart, totalPrice, sendOrder, availablePickupSlots, clearCart } = useCart();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [openCategories, setOpenCategories] = useState<{ [key: number]: boolean }>({});

  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [selectedExtras, setSelectedExtras] = useState<{ id: number; name: string; price: number }[]>([]);
  
  const [pickupTime, setPickupTime] = useState<string>('ASAP'); 

  // Mappa degli extra dinamica basata sugli ingredienti
  const availableExtras = useMemo(() => {
    return ingredients.map((ing: any) => ({
      id: ing.id,
      name: ing.name + (ing.isSpecial ? ' ⚠️' : ''),
      price: Number(ing.price)
    }));
  }, [ingredients]);
 
  // Map per la ricerca rapida degli ingredienti
  const ingredientsMap = useMemo(() => {
    const map = new Map<number, typeof ingredients[0]>();
    ingredients.forEach(ing => map.set(ing.id, ing));
    return map;
  }, [ingredients]);

  // Prodotti divisi per categoria con controllo stock
  const productsByCategory = useMemo(() => {
    const map: { [key: string]: MenuItem[] } = {};
    categories.forEach(cat => {
      map[cat.slug] = menu.filter(prod => {
        if (prod.category !== cat.slug) return false;
        if (!prod.ingredientIds || prod.ingredientIds.length === 0) return true;

        const allIngredientsInStock = prod.ingredientIds.every(ingId => {
          const ing = ingredientsMap.get(ingId);
          if (!ing) return true;
          const inStockValue = (ing as any).in_stock ?? (ing as any).inStock ?? true;
          return Boolean(inStockValue);
        });

        return allIngredientsInStock;
      });
    });
    return map;
  }, [categories, menu, ingredientsMap]);

  useEffect(() => {
    if (availablePickupSlots && availablePickupSlots.length > 0) {
      if (pickupTime === 'ASAP' || !availablePickupSlots.includes(pickupTime)) {
        setPickupTime(availablePickupSlots[0]);
      }
    }
  }, [availablePickupSlots, pickupTime]);

  useEffect(() => {
    if (categories.length > 0) {
      const initialOpenState: { [key: number]: boolean } = {};
      categories.forEach((cat) => {
        initialOpenState[cat.id] = true;
      });
      setOpenCategories(initialOpenState);
      setLoading(false);
    } else {
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [categories]);

  const toggleCategory = (catId: number) => {
    setOpenCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleProductClick = (product: MenuItem, isNonCustomizable?: boolean) => {
    setQuantity(1);
    setNotes('');
    setSelectedExtras([]);

    const category = categories.find(
      cat => cat.slug === product.category || cat.id === (product as any).categoryId
    );

    // Se la categoria non ha ingredienti o è una bevanda, aggiungi direttamente
    const isDrink = product.category === 'bevande' || product.category === 'bibite' || product.category === 'bevanda';
    if (isNonCustomizable || isDrink || !category || !category.hasIngredients) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
        notes: '',
        extras: []
      });
    } else {
      setSelectedProduct(product);
    }
  };

  const handleToggleExtra = (extra: { id: number; name: string; price: number }) => {
    setSelectedExtras(prev => {
      const exists = prev.some(e => e.id === extra.id);
      return exists ? prev.filter(e => e.id !== extra.id) : [...prev, extra];
    });
  };

  const handleConfirmAddToCart = () => {
    if (!selectedProduct) return;
    
    addToCart({
      productId: selectedProduct.id,
      name: selectedProduct.name,
      price: Number(selectedProduct.price),
      quantity: quantity,
      notes,
      extras: selectedExtras,   
      categoryId: selectedProduct.categoryId
    });

    setSelectedProduct(null);
  };

  const totalCartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return {
    user,
    menu,
    categories,
    ingredients,
    loading,
    openCategories,
    selectedProduct,
    setSelectedProduct,
    isCartOpen,
    setIsCartOpen,
    quantity,
    setQuantity,
    notes,
    setNotes,
    availableExtras,
    selectedExtras,
    handleToggleExtra,
    pickupTime,
    setPickupTime,
    availablePickupSlots,
    ingredientsMap,
    productsByCategory,
    isProductAvailable,
    toggleCategory,
    handleProductClick,
    handleConfirmAddToCart,
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    totalPrice,
    sendOrder,
    clearCart,
    totalCartItemsCount
  };
}