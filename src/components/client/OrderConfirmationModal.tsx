'use client';

import React from 'react';
import { useCart } from '../../context/CartContext';
import styles from './ClientHome.module.css';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    id: string | number;
    customerName: string;
    pickupTime: string;
    totalPrice: number;
    items: any[];
  } | null;
}

export default function OrderConfirmationModal({ isOpen, onClose, orderData }: OrderConfirmationModalProps) {
  // 🚀 Usiamo la funzione dinamica dal contesto per interrogare il DB dei reparti
  const { getItemDepartment } = useCart();

  if (!isOpen || !orderData) return null;

  // 🕒 Calcolo dinamico del messaggio di conferma basato sulle regole del Database
  const calculateTimeRange = (timeStr: string, items: any[] = []) => {
    if (!timeStr || timeStr === 'ASAP') return 'Orario in definizione';

    // 🎯 VERIFICA DINAMICA SUL DB: Controlla se tutti gli articoli appartengono a reparti a tempo fisso
    const hasOnlyFixedTime = items.length > 0 && items.every(item => {
      const deptInfo = getItemDepartment(item);
      return deptInfo.isIgnored && Boolean(deptInfo.fixedTimeMinutes);
    });

    if (hasOnlyFixedTime) {
      const fixedMinutes = items.length > 0 ? (getItemDepartment(items[0]).fixedTimeMinutes || 1) : 1;
      return `tra ${fixedMinutes} minut${fixedMinutes === 1 ? 'o' : 'i'}`;
    }

    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;

    const startMins = h * 60 + m;
    const endMins = startMins + 15; // 15 minuti di tempo ciclo standard per la produzione

    const endH = Math.floor(endMins / 60) % 24;
    const endM = endMins % 60;

    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    return `tra le ${timeStr} e le ${endTimeStr}`;
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.customModalCard}>
        <div className={styles.successIcon}>🎉</div>
        <h2 className={styles.customModalTitle} style={{ textAlign: 'center', marginBottom: '0.2rem' }}>
          Ordine Inviato con Successo!
        </h2>
        <p className={styles.orderNumber}>ID Ordine: #{orderData.id}</p>

        {/* Box Range Orario Richiesto */}
        <div className={styles.timeRangeBox}>
          <span className={styles.timeIcon}>⏰</span>
          <div>
            <p className={styles.timeLabel}>Orario di Ritiro Previsto</p>
            <p className={styles.timeValue}>
              L'ordine sarà pronto <strong>{calculateTimeRange(orderData.pickupTime, orderData.items)}</strong>
            </p>
          </div>
        </div>

        {/* Riepilogo Articoli */}
        <div className={styles.orderDetails}>
          <h4>Riepilogo per {orderData.customerName}</h4>
          <ul className={styles.itemsList}>
            {orderData.items.map((item, index) => {
              const qty = item.quantity || 1;
              const name = item.name || 'Prodotto';
              const price = item.price || 0;
              return (
                <li key={index}>
                  <span>{qty}x {name}</span>
                  <span>€{(price * qty).toFixed(2)}</span>
                </li>
              );
            })}
          </ul>
          <div className={styles.totalRow}>
            <span>Totale Complessivo</span>
            <span>€{orderData.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <button onClick={onClose} className={styles.productButton}>
          Perfetto, ho capito 👍
        </button>
      </div>
    </div>
  );
}