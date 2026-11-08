// Ruoli del sistema RBAC
export type UserRole = 'cliente' | 'gestore' | 'pizzaiolo' | 'admin';

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

// Stati dell'ordine per il KDS (Pizzaiolo) e il Cliente
export type OrderStatus = 'In Attesa' | 'In Preparazione' | 'In Forno' | 'Pronto';

// Modello dell'Ordine
export interface Order {
  id: number;
  customer_name: string;
  items: CartItem[];
  status: OrderStatus;
  total_price: number;
  created_at: string;
}