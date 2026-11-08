import React from 'react';
import styles from '../ClientHome.module.css';

interface OrderCardProps {
  order: any;
}

export default function OrderCard({ order }: OrderCardProps) {
  const isReady = order.status === 'ready';

  // Funzione per formattare il testo dell'articolo (gestisce quantità, nome, extra e note)
  const renderItemText = (item: any) => {
    let text = `${item.quantity}x ${item.product?.name || 'Prodotto'}`;

    // Gestione degli extra salvati come 'selectedExtras'
    if (item.selectedExtras && typeof item.selectedExtras === 'string' && item.selectedExtras.trim() !== '') {
      text += ` (Extra: ${item.selectedExtras})`;
    } else if (Array.isArray(item.extras) && item.extras.length > 0) {
      
      const extraNames = item.extras.map((e: any) => e.name || e.title || e.label || e).join(', ');
      if (extraNames) {
        text += ` (Extra: ${extraNames})`;
      }
    }

    // Gestione delle note dell'articolo
    if (item.notes && item.notes.trim() !== '') {
      text += ` [Note: ${item.notes}]`;
    }

    return text;
  };

  return (
    <div className={styles.categoryCard}>
      {/* Intestazione della card ordine */}
      <div className={styles.categoryHeader}>
        <div>
          <h3 className={styles.categoryTitle}>Ordine #{order.id}</h3>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Data: {new Date(order.createdAt).toLocaleString('it-IT')}
          </span>
        </div>
        <div>
          <span 
            style={{ 
              padding: '0.3rem 0.75rem', 
              borderRadius: '20px', 
              fontSize: '0.85rem',
              backgroundColor: isReady ? '#10b981' : '#f59e0b',
              color: '#fff',
              display: 'inline-block'
            }}
          >
            {isReady ? 'Pronto' : 'In attesa'}
          </span>
        </div>
      </div>

      {/* Corpo della card ordine */}
      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', color: '#cbd5e1' }}>
          <p style={{ margin: 0 }}><strong>Cliente:</strong> {order.customerName}</p>
          <p style={{ margin: 0 }}><strong>Orario Ritiro:</strong> {order.pickupTime}</p>
        </div>

        <div className={styles.cartItemCard}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', fontSize: '0.95rem' }}>Prodotti ordinati:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {order.items.map((item: any, idx: number) => {
              // 🔍 DEBUG: Log per ogni singolo elemento mappato
              

              return (
                <div key={item.id || idx} className={styles.cartItemBottomRow} style={{ borderBottom: '1px solid #1e293b', paddingBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ color: '#fff', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                    • {renderItemText(item)}
                  </span>
                  <span className={styles.productPrice} style={{ marginLeft: '1rem', whiteSpace: 'nowrap' }}>
                    €{(Number(item.unitPrice) * item.quantity).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className={styles.cartTotalRow} style={{ marginTop: '1rem', marginBottom: 0, paddingTop: '0.5rem', borderTop: '1px dashed #334155' }}>
            <span className={styles.cartTotalLabel}>Totale Ordine:</span>
            <span className={styles.cartTotalValue}>€{Number(order.totalPrice).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}