// src/context/OrderContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface KdsOrder {
  id: string; 
  customerName: string;
  items: any[];
  status: 'pending' | 'preparing' | 'baking' | 'ready' | 'delivering' | 'completed';
  time: string;
  totalPrice: number;
  pickupTime: string;
  orderType?: 'counter' | 'table' | 'delivery' | 'pickup';
  tableNumber?: number | null;
  deliveryAddress?: string | null;
  covers?: number | null;
}

export interface OvenCapacity {
  id: string;
  name: string;
  capacity: number;
}

interface OrderContextType {
  orders: KdsOrder[];
  completedOrders: KdsOrder[];
  ovensConfig: OvenCapacity[];
  setOrders: React.Dispatch<React.SetStateAction<KdsOrder[]>>;
  setCompletedOrders: React.Dispatch<React.SetStateAction<KdsOrder[]>>;
  advanceOrderStatus: (id: string, targetStatus?: KdsOrder['status']) => Promise<void>;
  generateDailyOrderId: () => string;
  fetchOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<KdsOrder[]>([]);
  
  const [ovensConfig, setOvensConfig] = useState<OvenCapacity[]>([
    { id: 'oven_1', name: 'Forno 1', capacity: 10 }
  ]);

  // 🚀 Recupera gli ordini dal DB e li smista in base a 'completed'
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && data.orders) {
        // Ordini in lavorazione/attivi (tutti tranne 'completed')
        const active = data.orders.filter((o: KdsOrder) => o.status !== 'completed');
        // Storico ordini conclusi ('completed')
        const completed = data.orders.filter((o: KdsOrder) => o.status === 'completed');
        
        setOrders(active);
        setCompletedOrders(completed);
      }
    } catch (err) {
      console.error("❌ Errore caricamento ordini dal database:", err);
    }
  }, []);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          const settings = data.settings;
          const loadedOvens: OvenCapacity[] = [];
          
          Object.keys(settings).forEach(key => {
            if (key.startsWith('oven_')) {
              loadedOvens.push({
                id: key,
                name: key.replace('oven_', 'Forno '),
                capacity: Number(settings[key])
              });
            }
          });

          if (loadedOvens.length > 0) {
            setOvensConfig(loadedOvens);
          }
        }
      })
      .catch(err => console.error("Errore caricamento forni nel contesto ordini:", err));

    fetchOrders();
  }, [fetchOrders]);

  const generateDailyOrderId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const todayKey = `${year}${month}${day}`;
    const storedDate = localStorage.getItem('order_date_key');
    let currentCounter = parseInt(localStorage.getItem('order_daily_counter') || '0', 10);

    if (storedDate !== todayKey) {
      currentCounter = 0;
      localStorage.setItem('order_date_key', todayKey);
    }

    currentCounter += 1;
    localStorage.setItem('order_daily_counter', String(currentCounter));

    return `${todayKey}-${hours}${minutes}-${currentCounter}`;
  };

  const advanceOrderStatus = async (id: string, targetStatus?: KdsOrder['status']) => {
    const orderToUpdate = [...orders, ...completedOrders].find(o => o.id === id);
    if (!orderToUpdate) return;

    let nextStatus: KdsOrder['status'] = targetStatus || orderToUpdate.status;

    // Logica automatica di avanzamento in base allo stato attuale e al tipo di ordine
    if (!targetStatus) {
      if (orderToUpdate.status === 'pending') {
        nextStatus = 'preparing';
      } else if (orderToUpdate.status === 'preparing') {
        nextStatus = 'baking';
      } else if (orderToUpdate.status === 'baking') {
        // Se è un ordine da cassa va direttamente a completed, altrimenti a ready per corriere/sala
        if (orderToUpdate.orderType === 'counter' || orderToUpdate.orderType === 'pickup') {
          nextStatus = 'completed';
        } else {
          nextStatus = 'ready';
        }
      } else if (orderToUpdate.status === 'ready') {
        if (orderToUpdate.orderType === 'delivery') {
          nextStatus = 'delivering';
        } else if (orderToUpdate.orderType === 'table') {
          nextStatus = 'completed';
        }
      } else if (orderToUpdate.status === 'delivering') {
        nextStatus = 'completed';
      }
    }

    // Aggiornamento sul backend tramite API PATCH
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        console.error("❌ Errore aggiornamento stato nel DB:", data.error);
        return;
      }
    } catch (e) {
      console.error("❌ Errore di rete aggiornamento stato ordine sul DB:", e);
      return;
    }

    // Se l'ordine raggiunge lo stato 'completed', viene spostato nello storico
    if (nextStatus === 'completed') {
      const finishedOrder = { ...orderToUpdate, status: 'completed' as const };
      setCompletedOrders(prevCompleted => [finishedOrder, ...prevCompleted.filter(o => o.id !== id)]);
      setOrders(prevOrders => prevOrders.filter(o => o.id !== id));
    } else {
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === id ? { ...order, status: nextStatus } : order
      ));
    }
  };

  return (
    <OrderContext.Provider value={{
      orders,
      completedOrders,
      ovensConfig,
      setOrders,
      setCompletedOrders,
      advanceOrderStatus,
      generateDailyOrderId,
      fetchOrders
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders deve essere usato all\'interno di un OrderProvider');
  }
  return context;
};