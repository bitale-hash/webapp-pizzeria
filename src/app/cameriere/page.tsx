// src/app/cameriere/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useOrders } from '../../context/OrderContext';
import styles from '../pizzaiolo/page.module.css';
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

export default function CamerierePage() {
  const { orders, completedOrders, advanceOrderStatus, fetchOrders } = useOrders() as any;
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    orderId: string | null;
    targetStatus: 'completed' | null;
  }>({ isOpen: false, orderId: null, targetStatus: null });

  useEffect(() => {
    fetchOrders().finally(() => setLoading(false));
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Filtra solo gli ordini al tavolo attivi (ready o in preparazione se gestiti dal cameriere)
  const tableActiveOrders = orders.filter(
    (order: any) => order.orderType === 'table' && (order.status === 'ready' || order.status === 'delivering')
  );

  const tableCompletedOrders = (completedOrders || []).filter(
    (order: any) => order.orderType === 'table'
  );

  const handleActionClick = (id: string, currentStatus: string) => {
    if (currentStatus === 'ready' || currentStatus === 'delivering') {
      setConfirmModal({ isOpen: true, orderId: id, targetStatus: 'completed' });
    }
  };

  const handleConfirmAction = async () => {
    if (confirmModal.orderId && confirmModal.targetStatus) {
      await advanceOrderStatus(confirmModal.orderId, confirmModal.targetStatus);
    }
    setConfirmModal({ isOpen: false, orderId: null, targetStatus: null });
  };

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
      if (item.notes && item.notes.trim() !== '') {
        text += ` [Note: ${item.notes}]`;
      }
      return text;
    }
    return 'Prodotto';
  };

  return (
    <main>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>🛎️ Dashboard Cameriere (Servizio al Tavolo)</h1>
            <p className={styles.emptyText} style={{ margin: '4px 0 0 0' }}>Gestione tavoli e storico ordini serviti.</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span className={styles.badge}>Da Servire: {tableActiveOrders.length}</span>
            <button 
              onClick={() => setShowHistory(!showHistory)} 
              className={styles.historyButton}
            >
              {showHistory ? '📋 Visualizza Attivi' : `📜 Storico Serviti (${tableCompletedOrders.length})`}
            </button>
          </div>
        </div>

        {loading ? (
          <p className={styles.emptyText}>Caricamento in corso...</p>
        ) : !showHistory ? (
          tableActiveOrders.length === 0 ? (
            <p className={styles.emptyText}>Nessun ordine al tavolo attivo al momento.</p>
          ) : (
            <div className={styles.grid}>
              {tableActiveOrders.map((order: any) => (
                <OrderCard 
                  key={order.id}
                  order={order}
                  role="cameriere"
                  getStableColorForOrder={getStableColorForOrder}
                  renderOrderNumberOnly={renderOrderNumberOnly}
                  formatDateTime={formatDateTime}
                  renderItemText={renderItemText}
                  onAdvanceClick={(id, status) => handleActionClick(id, status)}
                />
              ))}
            </div>
          )
        ) : (
          <div>
            <div className={styles.historyHeader}>
              <h2 className={styles.historyTitle}>Storico Tavoli Serviti</h2>
              <span className={styles.historyCount}>Totale archiviati: {tableCompletedOrders.length}</span>
            </div>

            {tableCompletedOrders.length === 0 ? (
              <p className={styles.emptyText}>Nessun ordine al tavolo nello storico.</p>
            ) : (
              <div className={styles.grid}>
                {tableCompletedOrders.map((order: any) => (
                  <OrderCard 
                    key={order.id}
                    order={order}
                    isHistory={true}
                    role="cameriere"
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