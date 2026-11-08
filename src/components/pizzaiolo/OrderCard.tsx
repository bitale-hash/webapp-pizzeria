import React from 'react';
import styles from './Pizzaiolo.module.css';

interface Props {
  order: any;
  isHistory?: boolean;
  getStableColorForOrder: (id: string) => string;
  renderOrderNumberOnly: (rawId: string) => React.ReactNode;
  formatDateTime: (rawId: string, timeStr: string) => string;
  renderItemText: (item: any) => string;
  onAdvanceClick?: (id: string, status: string) => void;
  onRevertClick?: (id: string) => void;
}

export default function OrderCard({
  order,
  isHistory = false,
  getStableColorForOrder,
  renderOrderNumberOnly,
  formatDateTime,
  renderItemText,
  onAdvanceClick,
  onRevertClick
}: Props) {
  const isPreparing = order.status === 'preparing' || order.status === 'baking';
  const cardBg = !isHistory && isPreparing ? getStableColorForOrder(order.id) : undefined;

  // Assegniamo il colore dinamico tramite variabile CSS custom
  const cardStyle = cardBg ? ({ '--dynamic-bg': cardBg } as React.CSSProperties) : {};

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
            Stato:{' '}
            <span className={styles.statusBold}>
              {order.status === 'pending' ? '🔴 In Attesa' :
               order.status === 'preparing' ? '🟡 In Preparazione' : '🟠 Nel Forno'}
            </span>
          </div>

          <div className={styles.cardActionRow}>
            {order.status === 'preparing' && onRevertClick && (
              <button
                onClick={() => onRevertClick(order.id)}
                className={styles.revertButton}
                title="Ripristina a In Attesa"
              >
                ↩️
              </button>
            )}

            {onAdvanceClick && (
              <button 
                onClick={() => onAdvanceClick(order.id, order.status)}
                className={styles.button}
              >
                {order.status === 'pending' ? 'Inizia Preparazione 🟡' :
                 order.status === 'preparing' ? 'Inforna 🟠' : 'Segna Pronto 🟢'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}