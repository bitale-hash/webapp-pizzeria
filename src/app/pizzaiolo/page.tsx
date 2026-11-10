'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePizzeria } from '../../context/PizzeriaContext';
import { useOrders } from '../../context/OrderContext';
import styles from './page.module.css';

import PizzaioloHeader from '../../components/pizzaiolo/PizzaioloHeader';
import DepartmentFilterBar from '../../components/pizzaiolo/DepartmentFilterBar';
import OrderCard from '../../components/OrderCard';
import OrderStatusModal from '../../components/pizzaiolo/OrderStatusModal';

const getStableColorForOrder = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsla(${h}, 70%, 25%, 0.85)`;
};

export default function PizzaioloPage() {
  const { user } = useAuth();
  const { menu, categories, departments } = usePizzeria();
  const { orders, completedOrders, advanceOrderStatus, fetchOrders } = useOrders();
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string | number>('all');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    orderId: string | null;
    targetStatus: 'baking' | 'ready' | 'completed' | null;
  }>({ isOpen: false, orderId: null, targetStatus: null });

  const prevPendingCount = useRef<number>(0);

  const playAlertSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.error("Errore riproduzione audio:", e);
    }
  };

  useEffect(() => {
    const currentPending = orders.filter(o => o.status === 'pending').length;
    if (currentPending > prevPendingCount.current) {
      playAlertSound();
    }
    prevPendingCount.current = currentPending;
  }, [orders]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof fetchOrders === 'function') {
        fetchOrders();
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleDelayAllOrders = async () => {
    if (!confirm("Sei sicuro di voler posticipare di 15 minuti il ritiro di tutti gli ordini attivi?")) return;
    try {
      const res = await fetch('/api/orders/delay-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes: 15 })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        if (typeof fetchOrders === 'function') fetchOrders();
      } else {
        alert("Errore durante il posticipo degli ordini.");
      }
    } catch (err) {
      console.error("Errore di rete:", err);
    }
  };

  const handleAdvanceClick = (id: string, currentStatus: string) => {
    console.log("🔥 CLICK RICEVUTO! ID:", id, "Stato attuale:", currentStatus);

    const order = orders.find(o => o.id === id);

    if (currentStatus === 'pending') {
      advanceOrderStatus(id, 'preparing');
    } else if (currentStatus === 'preparing') {
      setConfirmModal({ isOpen: true, orderId: id, targetStatus: 'baking' });
    } else if (currentStatus === 'baking') {
      const deliveryAddr = (order as any)?.deliveryAddress;
      const tableNum = (order as any)?.tableNumber;

      const hasDestination = Boolean(
        (deliveryAddr && typeof deliveryAddr === 'string' && deliveryAddr.trim() !== '') || 
        (tableNum !== null && tableNum !== undefined && String(tableNum).trim() !== '')
      );

      if (hasDestination) {
        // Se ha un tavolo o un indirizzo, passa a 'ready' per corriere/cameriere
        setConfirmModal({ isOpen: true, orderId: id, targetStatus: 'ready' });
      } else {
        // Se è da bancone/asporto locale senza destinazione, va direttamente a 'completed'
        setConfirmModal({ isOpen: true, orderId: id, targetStatus: 'completed' });
      }
    } else if (currentStatus === 'ready') {
      // 🚀 Gestione mancante: se l'ordine è 'ready' e il pizzaiolo lo clicca, lo archiviamo come completato
      advanceOrderStatus(id, 'completed' as any);
    }
  };
   
  const handleConfirmAction = () => {
    if (confirmModal.orderId && confirmModal.targetStatus) {
      advanceOrderStatus(confirmModal.orderId, confirmModal.targetStatus);
    }
    setConfirmModal({ isOpen: false, orderId: null, targetStatus: null });
  };

  const itemBelongsToDepartment = (item: any, targetDeptId: string | number) => {
    let itemDeptId = item.departmentId ? Number(item.departmentId) : null;
    if (!itemDeptId && item.categoryId) {
      const foundCat = categories.find((c: any) => Number(c.id) === Number(item.categoryId));
      if (foundCat && foundCat.departmentId) itemDeptId = Number(foundCat.departmentId);
    }
    if (!itemDeptId && item.productId && menu && menu.length > 0) {
      const foundProd = menu.find((p: any) => Number(p.id) === Number(item.productId));
      if (foundProd && foundProd.categoryId) {
        const foundCat = categories.find((c: any) => Number(c.id) === Number(foundProd.categoryId));
        if (foundCat && foundCat.departmentId) itemDeptId = Number(foundCat.departmentId);
      }
    }
    if (itemDeptId !== null && itemDeptId !== undefined) {
      return Number(itemDeptId) === Number(targetDeptId);
    }
    const targetDept = departments.find((d: any) => Number(d.id) === Number(targetDeptId));
    if (targetDept && String(targetDept.name).toLowerCase().includes('pizz')) return true;
    return false;
  };

  const sortedOrders = useMemo(() => {
      let list = orders.filter(order => order.status !== 'ready' && order.status !== 'delivering' && order.status !== 'completed');

      if (selectedDepartmentFilter !== 'all') {
        list = list.filter(order => order.items && order.items.some((item: any) => itemBelongsToDepartment(item, selectedDepartmentFilter)));
      }
      return list.sort((a, b) => {
        const isPriorityA = a.status === 'preparing' || a.status === 'baking';
        const isPriorityB = b.status === 'preparing' || b.status === 'baking';
        if (isPriorityA && !isPriorityB) return -1;
        if (!isPriorityA && isPriorityB) return 1;
        if (!a.pickupTime) return 1;
        if (!b.pickupTime) return -1;
        return a.pickupTime.localeCompare(b.pickupTime);
      });
  }, [orders, selectedDepartmentFilter, categories, menu]);

  const renderOrderNumberOnly = (rawId: string) => {
    const parts = rawId.split('-');
    if (parts.length >= 3) {
      const progressivePart = parts.slice(2).join('-');
      const cleanNumber = parseInt(progressivePart, 10) || progressivePart;
      return <span className={styles.orderNumberBadge}>#{cleanNumber}</span>;
    }
    return <span className={styles.orderNumberFallback}>#{rawId}</span>;
  };

  const formatDateTime = (rawId: string, timeStr: string) => {
    const parts = rawId.split('-');
    let formattedDate = '';
    if (parts.length >= 1 && parts[0].length === 8) {
      const year = parts[0].substring(0, 4);
      const month = parts[0].substring(4, 6);
      const day = parts[0].substring(6, 8);
      formattedDate = `${day}/${month}/${year}`;
    }
    let cleanTime = timeStr || '';
    const timeParts = cleanTime.split(':');
    if (timeParts.length >= 2) cleanTime = `${timeParts[0]}:${timeParts[1]}`;
    return formattedDate && cleanTime ? `${formattedDate} ${cleanTime}` : cleanTime || formattedDate;
  };

  const renderItemText = (item: any) => {
    if (typeof item === 'string') return item;
    if (item && item.formatted) return item.formatted;
    
    if (item && (item.name || item.product?.name)) {
      const productName = item.name || item.product?.name || 'Prodotto';
      const quantity = item.quantity || 1;
      let text = `${quantity}x ${productName}`;

      const rawExtras = item.selectedExtras || item.extras;
      try {
        let extras = rawExtras;
        if (typeof extras === 'string' && extras.trim() !== '') {
          if (extras.startsWith('[') || extras.startsWith('{')) {
            extras = JSON.parse(extras);
          }
        }
        
        if (Array.isArray(extras) && extras.length > 0) {
          const extraNames = extras.map((e: any) => e.name || e.title || e.label || e).join(', ');
          if (extraNames) text += ` (Extra: ${extraNames})`;
        } else if (typeof rawExtras === 'string' && rawExtras.trim() !== '') {
          text += ` (Extra: ${rawExtras})`;
        }
      } catch (e) {
        if (typeof rawExtras === 'string' && rawExtras.trim() !== '') {
          text += ` (Extra: ${rawExtras})`;
        }
      }

      if (item.notes && item.notes.trim() !== '') {
        text += ` [Note: ${item.notes}]`;
      }

      return text;
    }
    
    return 'Prodotto';
  };

  if (user?.role !== 'pizzaiolo' && user?.role !== 'admin') {
    return (
      <main>
        <div className={styles.container}>
          <h1 className={styles.title}>Accesso Negato</h1>
          <p>Questa sezione è riservata esclusivamente ai Pizzaioli.</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className={styles.container}>
        <PizzaioloHeader 
          activeCount={orders.length}
          completedCount={completedOrders.length}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          onDelayAll={handleDelayAllOrders}
        />

        {!showHistory && departments && departments.length > 0 && (
          <DepartmentFilterBar 
            departments={departments}
            selectedDepartmentFilter={selectedDepartmentFilter}
            onSelectFilter={setSelectedDepartmentFilter}
          />
        )}

        {!showHistory ? (
          <div className={styles.grid}>
            {sortedOrders.length === 0 ? (
              <p className={styles.emptyText}>Nessun ordine attivo trovato per il reparto selezionato.</p>
            ) : (
              sortedOrders.map(order => (
                <OrderCard 
                  key={order.id}
                  order={order}
                  getStableColorForOrder={getStableColorForOrder}
                  renderOrderNumberOnly={renderOrderNumberOnly}
                  formatDateTime={formatDateTime}
                  renderItemText={renderItemText}
                  onAdvanceClick={handleAdvanceClick}
                  onRevertClick={(id) => advanceOrderStatus(id, 'pending')}
                />
              ))
            )}
          </div>
        ) : (
          <div>
            <div className={styles.historyHeader}>
              <h2 className={styles.historyTitle}>Storico Ordini Completati</h2>
              <span className={styles.historyCount}>Totale archiviati: {completedOrders.length}</span>
            </div>

            {completedOrders.length === 0 ? (
              <p className={styles.emptyText}>Nessun ordine completato nello storico.</p>
            ) : (
              <div className={styles.grid}>
                {completedOrders.map(order => (
                  <OrderCard 
                    key={order.id}
                    order={order}
                    isHistory={true}
                    getStableColorForOrder={getStableColorForOrder}
                    renderOrderNumberOnly={renderOrderNumberOnly}
                    formatDateTime={formatDateTime}
                    renderItemText={renderItemText}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <OrderStatusModal 
        isOpen={confirmModal.isOpen}
        targetStatus={confirmModal.targetStatus}
        onClose={() => setConfirmModal({ isOpen: false, orderId: null, targetStatus: null })}
        onConfirm={handleConfirmAction}
      />
    </main>
  );
}