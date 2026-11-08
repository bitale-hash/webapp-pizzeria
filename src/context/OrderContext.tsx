'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface KdsOrder {
  id: string; 
  customerName: string;
  items: string[];
  status: 'pending' | 'preparing' | 'baking' | 'ready';
  time: string;
  totalPrice: number;
  pickupTime: string; 
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
  fetchOrders: () => Promise<void>; // 🚀 Esportato per permettere il re-fetch immediato
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<KdsOrder[]>([]);
  
  // Configurazione forni inizializzata dinamicamente
  const [ovensConfig, setOvensConfig] = useState<OvenCapacity[]>([
    { id: 'oven_1', name: 'Forno 1', capacity: 10 }
  ]);

  // 🚀 Funzione centralizzata per recuperare gli ordini aggiornati dal DB
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && data.orders) {
        
        const active = data.orders.filter((o: KdsOrder) => o.status !== 'ready');
        const completed = data.orders.filter((o: KdsOrder) => o.status === 'ready');
        setOrders(active);
        setCompletedOrders(completed);
      }
    } catch (err) {
      console.error("❌ Errore caricamento ordini dal database:", err);
    }
  }, []);

  // Caricamento iniziale degli ordini e delle impostazioni dal database
  useEffect(() => {
    // Caricamento settings e forni
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

    // Caricamento iniziale ordini
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

    if (!targetStatus) {
      if (orderToUpdate.status === 'pending') nextStatus = 'preparing';
      else if (orderToUpdate.status === 'preparing') nextStatus = 'baking';
      else if (orderToUpdate.status === 'baking') nextStatus = 'ready';
    }

    // Aggiornamento sul backend tramite API
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

    // Aggiornamento dello stato locale dopo la conferma del DB
    if (nextStatus === 'ready') {
      const finishedOrder = { ...orderToUpdate, status: 'ready' as const };
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
      fetchOrders // 🚀 Fornito nell'interfaccia
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