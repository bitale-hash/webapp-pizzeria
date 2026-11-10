// src/components/OrderCard.tsx
import React from 'react';
import styles from './pizzaiolo/Pizzaiolo.module.css';

interface Props {
  order: any;
  isHistory?: boolean;
  role?: 'pizzaiolo' | 'corriere' | 'cameriere';
  getStableColorForOrder?: (id: string) => string;
  renderOrderNumberOnly: (rawId: string) => React.ReactNode;
  formatDateTime: (rawId: string, timeStr: string) => string;
  renderItemText: (item: any) => string;
  onAdvanceClick?: (id: string, status: string) => void;
  onRevertClick?: (id: string) => void;
}

export default function OrderCard({
  order,
  isHistory = false,
  role = 'pizzaiolo',
  getStableColorForOrder,
  renderOrderNumberOnly,
  formatDateTime,
  renderItemText,
  onAdvanceClick,
  onRevertClick
}: Props) {
  const isPreparing = order.status === 'preparing' || order.status === 'baking';
  const cardBg = !isHistory && isPreparing && getStableColorForOrder ? getStableColorForOrder(order.id) : undefined;
  const cardStyle = cardBg ? ({ '--dynamic-bg': cardBg } as React.CSSProperties) : {};

  const getStatusLabel = () => {
    switch (order.status) {
      case 'pending': return '🔴 In Attesa';
      case 'preparing': return '🟡 In Preparazione';
      case 'baking': return '🟠 Nel Forno';
      case 'ready': return '🟢 Pronto';
      case 'delivering': return '🛵 In Viaggio';
      case 'delivered': return '✅ Consegnato / Servito';
      default: return order.status;
    }
  };

  const getButtonText = () => {
    if (role === 'pizzaiolo') {
      if (order.status === 'pending') return 'Inizia Preparazione 🟡';
      if (order.status === 'preparing') return 'Inforna 🟠';
      return 'Segna Pronto 🟢';
    }
    if (role === 'corriere') {
      if (order.status === 'ready') return '🚀 Prendi in Carico / Parti';
      if (order.status === 'delivering') return '✅ Segna come Consegnato';
    }
    if (role === 'cameriere') {
      return '✅ Servito al Tavolo';
    }
    return 'Avanza';
  };

  return (
    <div 
      className={`${styles.card} ${!isHistory && isPreparing ? styles.cardActiveState : ''} ${isHistory ? styles.cardCompleted : ''}`}
      style={cardStyle}
    >
      <div>
        <div className={styles.cardHeaderTop}>
          <div className={styles.cardIdSection}>
            <span className={styles.cardOrderLabel}>ORDINE</span>
            {renderOrderNumberOnly(order.id)}
          </div>
          
          <div className={styles.cardMetaSection}>
            <span className={styles.cardCreatedAt}>
              Creato: <strong className={styles.whiteText}>{formatDateTime(order.id, order.time)}</strong>
            </span>
            
            {order.pickupTime && (
              <div className={styles.pickupRow}>
                <span className={isHistory ? styles.pickupBadgeCompleted : styles.pickupBadge}>
                  🕒 Ritiro: {order.pickupTime}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <p className={styles.customer}>Cliente: <strong>{order.customerName}</strong></p>
        
        <div style={{ fontSize: '0.85rem', marginBottom: '10px', color: '#38bdf8', fontWeight: '500', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {order.orderType === 'table' && (
            <span>📍 <strong>Servizio al Tavolo</strong> (Tavolo #{order.tableNumber || order.table_number || 'N/D'}{order.covers ? ` • ${order.covers} coperti` : ''})</span>
          )}
          {order.orderType === 'delivery' && (
            <span>🏠 <strong>Consegna a Indirizzo</strong>: {order.deliveryAddress || order.delivery_address || 'Indirizzo non specificato'}</span>
          )}
          {(!order.orderType || order.orderType === 'counter' || order.orderType === 'pickup') && (
            <span>🛍️ <strong>Ritiro alla Cassa / Locale</strong></span>
          )}
        </div>
        
        <div className={styles.itemsBox}>
          <ul className={styles.itemsList}>
            {order.items.map((item: any, idx: number) => (
              <li key={idx} className={`${styles.itemLine} ${isHistory ? styles.itemHistoryLine : styles.itemNormal}`}>
                • {renderItemText(item)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {isHistory ? (
        <div className={styles.historyCardFooter}>
          <span className={styles.completedLabelText}>
            🟢 Completato e Consegnato
          </span>
          {order.totalPrice && (
            <span className={styles.historyPrice}>
              € {Number(order.totalPrice).toFixed(2)}
            </span>
          )}
        </div>
      ) : (
        <div className={styles.footerCard}>
          <div className={styles.status}>
            Stato: <span className={styles.statusBold}>{getStatusLabel()}</span>
          </div>

          <div className={styles.cardActionRow}>
            {/* 🚀 Mostra il tasto di ritorno per il pizzaiolo (se preparing) o per il corriere (se delivering) */}
            {onRevertClick && (
              ((role === 'pizzaiolo' && order.status === 'preparing') || 
               (role === 'corriere' && order.status === 'delivering')) && (
                <button
                  onClick={() => onRevertClick(order.id)}
                  className={styles.revertButton}
                  title="Ripristina allo stato precedente"
                >
                  ↩️
                </button>
              )
            )}

            {onAdvanceClick && (
              <button 
                onClick={() => onAdvanceClick(order.id, order.status)}
                className={styles.button}
                style={{
                  backgroundColor: role === 'corriere' && order.status === 'ready' ? '#38bdf8' : 
                                   role === 'cameriere' ? '#22c55e' : undefined,
                  color: role === 'corriere' && order.status === 'ready' ? '#0f172a' : undefined
                }}
              >
                {getButtonText()}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}