//components/client/sub-components/OrderTypeSelector.tsx
'use client';

import { useState, useEffect } from 'react';

interface OrderTypeSelectorProps {
  selectedType: string;
  onSelectType: (type: string) => void;
  additionalInfo: { tableNumber: string; deliveryAddress: string };
  onInfoChange: (field: string, value: string) => void;
}

export default function OrderTypeSelector({
  selectedType,
  onSelectType,
  additionalInfo,
  onInfoChange,
}: OrderTypeSelectorProps) {
  const [enabledTypes, setEnabledTypes] = useState({
    counter: true,
    table: true,
    delivery: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          const s = data.settings;
          
          let counter = true;
          let table = true;
          let delivery = true;

          // 🚀 Legge correttamente dalla chiave unificata order_types_config (con fallback sulle singole chiavi)
          if (s.order_types_config) {
            try {
              const parsedConfig = JSON.parse(s.order_types_config);
              counter = parsedConfig.enableCounterPickup ?? true;
              table = parsedConfig.enableTableService ?? true;
              delivery = parsedConfig.enableDelivery ?? true;
            } catch (e) {
              console.error('Errore parsing order_types_config nel selettore', e);
            }
          } else {
            counter = s.enable_counter_pickup !== 'false';
            table = s.enable_table_service !== 'false';
            delivery = s.enable_delivery !== 'false';
          }

          setEnabledTypes({
            counter,
            table,
            delivery,
          });

          // Se il tipo attualmente selezionato è stato disabilitato dall'admin,
          // passa automaticamente alla prima opzione disponibile.
          if (selectedType === 'counter' && !counter) {
            if (table) onSelectType('table');
            else if (delivery) onSelectType('delivery');
          } else if (selectedType === 'table' && !table) {
            if (counter) onSelectType('counter');
            else if (delivery) onSelectType('delivery');
          } else if (selectedType === 'delivery' && !delivery) {
            if (counter) onSelectType('counter');
            else if (table) onSelectType('table');
          }
        }
      } catch (error) {
        console.error('Errore caricamento opzioni di ritiro:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [selectedType, onSelectType]);

  if (loading) {
    return <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Caricamento opzioni di consegna...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1rem 0', padding: '1rem', background: '#1e293b', borderRadius: '8px', border: '1px solid #334155' }}>
      <label style={{ color: '#f8fafc', fontWeight: 'bold', fontSize: '0.95rem' }}>
        Modalità di Ritiro / Consegna
      </label>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Opzione Cassa */}
        {enabledTypes.counter && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: '#f1f5f9' }}>
            <input
              type="radio"
              name="orderType"
              value="counter"
              checked={selectedType === 'counter'}
              onChange={() => onSelectType('counter')}
              style={{ accentColor: '#2563eb' }}
            />
            <div>
              <span style={{ fontWeight: '500' }}>Ritiro alla Cassa / Locale</span>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Ritira direttamente al banco</p>
            </div>
          </label>
        )}

        {/* Opzione Tavolo */}
        {enabledTypes.table && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: '#f1f5f9' }}>
            <input
              type="radio"
              name="orderType"
              value="table"
              checked={selectedType === 'table'}
              onChange={() => onSelectType('table')}
              style={{ accentColor: '#2563eb' }}
            />
            <div>
              <span style={{ fontWeight: '500' }}>Servizio al Tavolo</span>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Servito direttamente al tuo tavolo</p>
            </div>
          </label>
        )}

        {/* Opzione Asporto / Consegna */}
        {enabledTypes.delivery && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: '#f1f5f9' }}>
            <input
              type="radio"
              name="orderType"
              value="delivery"
              checked={selectedType === 'delivery'}
              onChange={() => onSelectType('delivery')}
              style={{ accentColor: '#2563eb' }}
            />
            <div>
              <span style={{ fontWeight: '500' }}>Asporto / Consegna a Indirizzo</span>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Ricevi comodamente a casa</p>
            </div>
          </label>
        )}
      </div>

      {/* Campo Dinamico per il Tavolo */}
      {selectedType === 'table' && enabledTypes.table && (
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 'bold' }}>
            Numero Tavolo *
          </label>
          <input
            type="text"
            placeholder="Es. Tavolo 12"
            value={additionalInfo.tableNumber}
            onChange={(e) => onInfoChange('tableNumber', e.target.value)}
            required
            style={{ padding: '0.5rem', background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '4px', fontSize: '0.9rem' }}
          />
        </div>
      )}

      {/* Campo Dinamico per l'Indirizzo */}
      {selectedType === 'delivery' && enabledTypes.delivery && (
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 'bold' }}>
            Indirizzo di Consegna *
          </label>
          <input
            type="text"
            placeholder="Via Roma 10, Interno 3..."
            value={additionalInfo.deliveryAddress}
            onChange={(e) => onInfoChange('deliveryAddress', e.target.value)}
            required
            style={{ padding: '0.5rem', background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '4px', fontSize: '0.9rem' }}
          />
        </div>
      )}
    </div>
  );
}