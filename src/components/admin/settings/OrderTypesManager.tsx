//components/admin/settings/OrderTypesManager.tsx
'use client';

import styles from './AdminSettings.module.css';

interface OrderTypesManagerProps {
  orderTypes: {
    enableCounterPickup: boolean;
    enableTableService: boolean;
    enableDelivery: boolean;
    tableServiceFee: number;
    deliveryFee: number;
    minDeliveryOrder: number;
    totalTables: number;
    maxDeliveryDistance: number;
  };
  onChange: (field: string, value: boolean | number) => void;
}

export default function OrderTypesManager({ orderTypes, onChange }: OrderTypesManagerProps) {
  return (
    <div className={styles.cleanupCardBox}>
      <h3 className={styles.cleanupTitle}>Gestione Tipi di Ritiro e Consegna</h3>
      <p className={styles.cleanupDescription}>
        Scegli quali opzioni di consegna rendere disponibili per i clienti all'interno del carrello e imposta i relativi costi.
      </p>
      
      <div className={styles.ovensListContainer}>
        {/* Opzione 1: Ritiro alla cassa / locale */}
        <div className={styles.ovenRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className={styles.ovenTitle}>Ritiro alla Cassa / Locale</span>
              <p className={styles.cleanupDescription} style={{ margin: '0.2rem 0 0 0' }}>
                Il cliente ritira direttamente al banco una volta pronto.
              </p>
            </div>
            <label className={styles.shiftLabel} style={{ margin: 0 }}>
              <input
                type="checkbox"
                className={styles.checkboxInput}
                checked={orderTypes.enableCounterPickup}
                onChange={(e) => onChange('enableCounterPickup', e.target.checked)}
              />
              <span className={styles.cleanupLabel}>Abilitato</span>
            </label>
          </div>
        </div>

        {/* Opzione 2: Servizio al Tavolo */}
        <div className={styles.ovenRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className={styles.ovenTitle}>Servizio al Tavolo (N. ...)</span>
              <p className={styles.cleanupDescription} style={{ margin: '0.2rem 0 0 0' }}>
                Il cliente indica il numero del tavolo in cui si trova seduto.
              </p>
            </div>
            <label className={styles.shiftLabel} style={{ margin: 0 }}>
              <input
                type="checkbox"
                className={styles.checkboxInput}
                checked={orderTypes.enableTableService}
                onChange={(e) => onChange('enableTableService', e.target.checked)}
              />
              <span className={styles.cleanupLabel}>Abilitato</span>
            </label>
          </div>

          {orderTypes.enableTableService && (
            <>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center', 
                paddingTop: '0.5rem', 
                borderTop: '1px solid rgba(255, 255, 255, 0.1)' 
              }}>
                <span className={styles.cleanupDescription} style={{ margin: 0, fontWeight: 500 }}>
                  Costo coperto a persona (€):
                </span>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  value={orderTypes.tableServiceFee ?? 0}
                  onChange={(e) => onChange('tableServiceFee', parseFloat(e.target.value) || 0)}
                  style={{
                    width: '90px',
                    padding: '0.3rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    color: '#fff',
                    textAlign: 'right'
                  }}
                />
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center', 
                paddingTop: '0.5rem', 
                borderTop: '1px solid rgba(255, 255, 255, 0.1)' 
              }}>
                <span className={styles.cleanupDescription} style={{ margin: 0, fontWeight: 500 }}>
                  Numero Totale di Tavoli nel Locale:
                </span>
                <input
                  type="number"
                  style={{
                    width: '90px',
                    padding: '0.3rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    color: '#fff',
                    textAlign: 'right'
                  }}
                  min="1"
                  value={orderTypes.totalTables ?? 20}
                  onChange={(e) => onChange('totalTables', parseInt(e.target.value, 10) || 1)}
                />
              </div>
            </>
          )}
        </div>

        {/* Opzione 3: Asporto / Consegna a Indirizzo */}
        <div className={styles.ovenRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className={styles.ovenTitle}>Asporto / Consegna a Indirizzo</span>
              <p className={styles.cleanupDescription} style={{ margin: '0.2rem 0 0 0' }}>
                Il cliente inserisce l'indirizzo per ricevere l'ordine a domicilio.
              </p>
            </div>
            <label className={styles.shiftLabel} style={{ margin: 0 }}>
              <input
                type="checkbox"
                className={styles.checkboxInput}
                checked={orderTypes.enableDelivery}
                onChange={(e) => onChange('enableDelivery', e.target.checked)}
              />
              <span className={styles.cleanupLabel}>Abilitato</span>
            </label>
          </div>

          {orderTypes.enableDelivery && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              {/* Costo del trasporto */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={styles.cleanupDescription} style={{ margin: 0, fontWeight: 500 }}>
                  Costo del trasporto / consegna (€):
                </span>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  value={orderTypes.deliveryFee ?? 0}
                  onChange={(e) => onChange('deliveryFee', parseFloat(e.target.value) || 0)}
                  style={{
                    width: '90px',
                    padding: '0.3rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    color: '#fff',
                    textAlign: 'right'
                  }}
                />
              </div>

              {/* Spesa Minima */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={styles.cleanupDescription} style={{ margin: 0, fontWeight: 500 }}>
                  Spesa minima per la consegna (€):
                </span>
                <input
                  type="number"
                  step="1.00"
                  min="0"
                  value={orderTypes.minDeliveryOrder ?? 0}
                  onChange={(e) => onChange('minDeliveryOrder', parseFloat(e.target.value) || 0)}
                  style={{
                    width: '90px',
                    padding: '0.3rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    color: '#fff',
                    textAlign: 'right'
                  }}
                />
              </div>

              {/* Distanza Massima Consegna (km) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={styles.cleanupDescription} style={{ margin: 0, fontWeight: 500 }}>
                  Distanza massima consegna (km):
                </span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={orderTypes.maxDeliveryDistance ?? 5}
                  onChange={(e) => onChange('maxDeliveryDistance', parseFloat(e.target.value) || 0)}
                  style={{
                    width: '90px',
                    padding: '0.3rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    color: '#fff',
                    textAlign: 'right'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}