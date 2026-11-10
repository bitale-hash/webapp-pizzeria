// src/app/corriere/page.tsx
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

export default function CorrierePage() {
  const { orders, completedOrders, advanceOrderStatus, fetchOrders } = useOrders() as any;
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [restaurantAddress, setRestaurantAddress] = useState<string>('Via Roma 1, Taviano LE');

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    orderId: string | null;
    targetStatus: 'delivering' | 'completed' | null;
  }>({ isOpen: false, orderId: null, targetStatus: null });

  useEffect(() => {
    async function loadData() {
      try {
        await fetchOrders();
        const res = await fetch('/api/general');
        const data = await res.json();
        if (data && data.address) {
          const cleanAddr = data.address.replace(/[\n\r]+/g, ', ').replace(/\s+/g, ' ').trim();
          setRestaurantAddress(cleanAddr);
        }
      } catch (err) {
        console.error('Errore caricamento dati corriere:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const deliveryActiveOrders = orders.filter(
    (order: any) => order.orderType === 'delivery' && (order.status === 'ready' || order.status === 'delivering')
  );

  const deliveryCompletedOrders = (completedOrders || []).filter(
    (order: any) => order.orderType === 'delivery'
  );

  const handleOpenOptimizedRoute = () => {
    const deliveringOrders = deliveryActiveOrders.filter((order: any) => order.status === 'delivering');

    if (deliveringOrders.length === 0) {
      alert("Nessun ordine nello stato 'In viaggio' (delivering) da ottimizzare. Sposta prima gli ordini pronti in 'In viaggio'.");
      return;
    }

    const originDest = encodeURIComponent(restaurantAddress);

    const destinations = deliveringOrders
      .map((order: any) => order.deliveryAddress)
      .filter((addr: any): addr is string => Boolean(addr && addr.trim() !== ''));

    if (destinations.length === 0) {
      alert("Nessun indirizzo di consegna valido trovato tra gli ordini in viaggio.");
      return;
    }

    let url = '';

    if (destinations.length === 1) {
      url = `https://www.google.com/maps/dir/?api=1&origin=${originDest}&destination=${originDest}&waypoints=${encodeURIComponent(destinations[0])}&travelmode=driving`;
    } else {
      const encodedDestinations = destinations.map((addr: string) => encodeURIComponent(addr));
      const waypoints = encodedDestinations.slice(0, -1).join('|');
      const finalDestination = encodedDestinations[encodedDestinations.length - 1];

      url = `https://www.google.com/maps/dir/?api=1&origin=${originDest}&destination=${originDest}&waypoints=${waypoints}%7C${finalDestination}&travelmode=driving`;
    }

    window.open(url, '_blank');
  };

  const handleActionClick = (id: string, currentStatus: string) => {
    if (currentStatus === 'ready') {
      setConfirmModal({ isOpen: true, orderId: id, targetStatus: 'delivering' });
    } else if (currentStatus === 'delivering') {
      setConfirmModal({ isOpen: true, orderId: id, targetStatus: 'completed' });
    }
  };

  const handleConfirmAction = async () => {
    if (confirmModal.orderId && confirmModal.targetStatus) {
      await advanceOrderStatus(confirmModal.orderId, confirmModal.targetStatus);
    }
    setConfirmModal({ isOpen: false, orderId: null, targetStatus: null });
  };

  // 🚀 Funzione per gestire il ritorno allo stato precedente (es. da delivering a ready)
  const handleRevertClick = async (id: string) => {
    const order = orders.find((o: any) => o.id === id);
    if (!order) return;

    if (order.status === 'delivering') {
      if (confirm("Vuoi riportare questo ordine allo stato 'Pronto' (ready)?")) {
        await advanceOrderStatus(id, 'ready');
      }
    }
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
            <h1 className={styles.title}>🛵 Dashboard Corriere (Consegne)</h1>
            <p className={styles.emptyText} style={{ margin: '4px 0 0 0' }}>Gestione spedizioni e storico consegne effettuate.</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={styles.badge}>Da Consegnare: {deliveryActiveOrders.length}</span>
            
            {!showHistory && (
              <button
                onClick={handleOpenOptimizedRoute}
                style={{
                  backgroundColor: '#16a34a',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.9rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                🗺️ Avvia Navigazione (Ritorno alla Pizzeria)
              </button>
            )}

            <button 
              onClick={() => setShowHistory(!showHistory)} 
              className={styles.historyButton}
            >
              {showHistory ? '📋 Visualizza Attivi' : `📜 Storico Consegnati (${deliveryCompletedOrders.length})`}
            </button>
          </div>
        </div>

        {loading ? (
          <p className={styles.emptyText}>Caricamento in corso...</p>
        ) : !showHistory ? (
          deliveryActiveOrders.length === 0 ? (
            <p className={styles.emptyText}>Nessun ordine di consegna attivo al momento.</p>
          ) : (
            <div className={styles.grid}>
              {deliveryActiveOrders.map((order: any) => (
                <OrderCard 
                  key={order.id}
                  order={order}
                  role="corriere"
                  getStableColorForOrder={getStableColorForOrder}
                  renderOrderNumberOnly={renderOrderNumberOnly}
                  formatDateTime={formatDateTime}
                  renderItemText={renderItemText}
                  onAdvanceClick={(id, status) => handleActionClick(id, status)}
                  onRevertClick={(id) => handleRevertClick(id)} // 👈 Aggiunto il tasto per tornare indietro
                />
              ))}
            </div>
          )
        ) : (
          <div>
            <div className={styles.historyHeader}>
              <h2 className={styles.historyTitle}>Storico Consegne Effettuate</h2>
              <span className={styles.historyCount}>Totale archiviati: {deliveryCompletedOrders.length}</span>
            </div>

            {deliveryCompletedOrders.length === 0 ? (
              <p className={styles.emptyText}>Nessuna consegna completata nello storico.</p>
            ) : (
              <div className={styles.grid}>
                {deliveryCompletedOrders.map((order: any) => (
                  <OrderCard 
                    key={order.id}
                    order={order}
                    isHistory={true}
                    role="corriere"
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