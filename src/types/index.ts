// Ruoli del sistema RBAC
 
export type UserRole = 'cliente' | 'gestore' | 'pizzaiolo' | 'admin' | 'corriere' | 'cameriere';

// Ingrediente (gestito dal Gestore o Admin)
export interface Ingredient {
  id: number;
  name: string;
  price: number;
  is_available: boolean; // Toggle disponibilità
}

// Prodotto (Pizze, Bibite, Dessert)
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean; // Toggle disponibilità menù cliente
}

// Elemento nel carrello del cliente (con eventuali personalizzazioni)
export interface CartItem {
  product: Product;
  quantity: number;
  customIngredients?: Ingredient[]; // Modifiche agli ingredienti
  notes?: string; // Es. "senza cipolla"
}
 
// Stati dell'ordine standardizzati in tutto il sistema
export type OrderStatus = 'pending' | 'preparing' | 'baking' | 'ready' | 'delivering' | 'completed';
 

// Modello dell'Ordine
export interface Order {
  id: string | number;
  customerName?: string;
  customer_name?: string;
  items: CartItem[] | any[];
  status: OrderStatus | string;
  totalPrice?: number;
  total_price?: number;
  created_at?: string;
  pickupTime?: string;
  orderType?: string;
  tableNumber?: number | null;
  deliveryAddress?: string | null;
  covers?: number | null;
}