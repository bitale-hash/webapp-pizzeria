//components/client/CartModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import styles from './ClientHome.module.css';
import OrderConfirmationModal from './OrderConfirmationModal';
import OrderTypeSelector from './sub-components/OrderTypeSelector';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cart: any[];
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  totalPrice: number;
  pickupTime: string;
  setPickupTime: (v: string) => void;
  availablePickupSlots: string[];
  user: any;
  sendOrder: (customerName: string, pickupTime?: string, orderMeta?: any) => Promise<string | number | null | undefined>;
}

export default function CartModal({
  isOpen, onClose, cart, updateQuantity, removeFromCart,
  totalPrice, pickupTime, setPickupTime, availablePickupSlots, user, sendOrder
}: Props) {
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderType, setOrderType] = useState('counter');
  
  // 🚀 Stato per memorizzare le eccezioni del calendario scaricate dal backend
  const [calendarExceptions, setCalendarExceptions] = useState<any[]>([]);
  
  // Aggiunto 'covers' per gestire il numero di coperti al tavolo
  const [additionalInfo, setAdditionalInfo] = useState({ 
    tableNumber: '', 
    deliveryAddress: '', 
    covers: '1' 
  });

  const handleInfoChange = (field: string, value: string) => {
    setAdditionalInfo(prev => ({ ...prev, [field]: value }));
  };
  
  const { getItemDepartment, cartError, setCartError, calculateFinalTotal } = useCart();
  const [displayTotal, setDisplayTotal] = useState(totalPrice);

  // 🚀 Carica le eccezioni del calendario quando il modale si apre
  useEffect(() => {
    if (isOpen) {
      fetch('/api/calendar')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCalendarExceptions(data.exceptions || []);
          }
        })
        .catch(err => console.error('Errore caricamento eccezioni calendario:', err));
    }
  }, [isOpen]);

  // 🚀 Ricalcola il totale dinamico quando cambiano carrello, tipo di ordine o coperti
  useEffect(() => {
    const updateDisplayTotal = async () => {
      const coversNum = parseInt(additionalInfo.covers, 10) || 1;
      const computed = await calculateFinalTotal(orderType, coversNum);
      setDisplayTotal(computed);
    };
    updateDisplayTotal();
  }, [totalPrice, orderType, additionalInfo.covers, calculateFinalTotal]);

  const hasOnlyFixedTime = cart.length > 0 && cart.every(item => {
    const deptInfo = getItemDepartment(item);
    return deptInfo.isIgnored && Boolean(deptInfo.fixedTimeMinutes);
  });

  const fixedMinutes = hasOnlyFixedTime && cart.length > 0 
    ? (getItemDepartment(cart[0]).fixedTimeMinutes || 1) 
    : 1;

  if (!isOpen) return null;

  const calculateTimeRange = (timeStr: string) => {
    if (!timeStr || timeStr === 'ASAP') return 'Orario in definizione';
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;

    const startMins = h * 60 + m;
    const endMins = startMins + 15;

    const endH = Math.floor(endMins / 60) % 24;
    const endM = endMins % 60;

    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    return `tra le ${timeStr} e le ${endTimeStr}`;
  };

// 🚀 Funzione di validazione sicura con debug e confronto date pulito
  const validateCalendarAndSchedule = (targetDateStr: string, timeStr: string) => {
    // Estrae la data locale pulita "YYYY-MM-DD" senza problemi di UTC/fuso orario
    const now = new Date();
    const localDateOnly = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    console.log("Data locale di controllo:", localDateOnly);
    console.log("Orario selezionato:", timeStr);
    console.log("Eccezioni caricate:", calendarExceptions);

    // Cerca l'eccezione confrontando solo la stringa della data (primi 10 caratteri)
    const exception = calendarExceptions.find(ex => {
      if (!ex.date) return false;
      const exDateOnly = ex.date.toString().split('T')[0];
      return exDateOnly === localDateOnly;
    });

    if (exception) {
      console.log("Trovata eccezione per oggi:", exception);

      // Se il locale è chiuso interamente (es. ferie)
      if (exception.isClosed) {
        return { 
          isValid: false, 
          error: exception.reason ? `Chiuso straordinariamente: ${exception.reason}` : 'Il locale è chiuso in questa data (Chiusura straordinaria).' 
        };
      }

      // Altrimenti verifica che l'orario rientri nei turni straordinari previsti
      if (timeStr && timeStr !== 'ASAP') {
        const parseTimeToMinutes = (t: string) => {
          if (!t) return 0;
          let timeString = t.trim().toUpperCase();
          let isPM = timeString.includes('PM');
          let isAM = timeString.includes('AM');
          
          timeString = timeString.replace('AM', '').replace('PM', '').trim();
          let [h, m] = timeString.split(':').map(Number);
          if (isNaN(h)) h = 0;
          if (isNaN(m)) m = 0;

          if (isPM && h < 12) h += 12;
          if (isAM && h === 12) h = 0;

          return h * 60 + m;
        };

        const targetMins = parseTimeToMinutes(timeStr);

        let inRange = false;
        if (exception.hasLunch && exception.lunchOpen && exception.lunchClose) {
          if (targetMins >= parseTimeToMinutes(exception.lunchOpen) && targetMins <= parseTimeToMinutes(exception.lunchClose)) {
            inRange = true;
          }
        }
        if (exception.hasDinner && exception.dinnerOpen && exception.dinnerClose) {
          if (targetMins >= parseTimeToMinutes(exception.dinnerOpen) && targetMins <= parseTimeToMinutes(exception.dinnerClose)) {
            inRange = true;
          }
        }

        console.log("Target minuti:", targetMins, "In range?:", inRange);

        if (!inRange) {
          return { isValid: false, error: 'Orario selezionato fuori dalla fascia di apertura straordinaria prevista.' };
        }
      }
    } else {
      console.log("Nessuna eccezione trovata per oggi, ordine consentito dalle regole standard.");
    }

    return { isValid: true };
  };

  return (
    <>
      <div className={styles.modalOverlay}>
        <div className={styles.customModalCard}>
          
          {/* Header Modale */}
          <div className={styles.customModalHeader}>
            <h2 className={styles.customModalTitle}>
              🛒 Il Tuo Carrello
            </h2>
            <button onClick={onClose} className={styles.customCloseButton}>
              ✕
            </button>
          </div>

          {/* Banner di Errore basato su classi CSS */}
          {cartError && (
            <div className={`${styles.cartItemCard} ${styles.errorBannerContainer}`}>
              <div className={styles.errorBannerRow}>
                <div className={styles.errorBannerContent}>
                  <span>⚠️</span>
                  <p className={styles.cartItemNotes} style={{ color: '#fca5a5' }}>
                    {cartError}
                  </p>
                </div>
                <button 
                  onClick={() => setCartError(null)} 
                  className={`${styles.customCloseButton} ${styles.errorCloseBtn}`}
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Lista Articoli */}
          {cart.length === 0 ? (
            <p className={styles.cartEmptyText}>Il carrello è vuoto.</p>
          ) : (
            <div className={styles.customExtrasScrollContainer}>
              {cart.map(item => {
                const itemExtrasTotal = item.extras.reduce((acc: number, ext: any) => acc + ext.price, 0);
                const itemTotal = (item.price + itemExtrasTotal) * item.quantity;

                return (
                  <div key={item.id} className={styles.cartItemCard}>
                    <div className={styles.cartItemTopRow}>
                      <div>
                        <h4 className={styles.cartItemName}>{item.name}</h4>
                        
                        {item.ingredients && item.ingredients.length > 0 && (
                          <div className={styles.cartIngredientsWrapper}>
                            {item.ingredients.map((ing: any) => (
                              <span 
                                key={ing.id} 
                                className={`${styles.cartIngredientTag} ${ing.isSpecial ? styles.cartIngredientSpecial : styles.cartIngredientNormal}`}
                              >
                                {ing.isSpecial ? '⚠️ ' : ''}{ing.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {item.notes && <p className={styles.cartItemNotes}>Note: {item.notes}</p>}
                        
                        {item.extras.length > 0 && (
                          <p className={styles.cartItemExtras}>
                            Extra: {item.extras.map((e: any) => e.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <span className={styles.cartItemPrice}>€ {itemTotal.toFixed(2)}</span>
                    </div>

                    <div className={styles.cartItemBottomRow}>
                      <div className={styles.customQuantityControls}>
                        <button onClick={() => updateQuantity(item.id, -1)} className={styles.customQtyBtn}>-</button>
                        <span className={styles.customQtyNumber}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className={styles.customQtyBtn}>+</button>
                      </div>

                      <button onClick={() => removeFromCart(item.id)} className={styles.cartRemoveBtn}>
                        Rimuovi 🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer con Totale, Orario, Tipo di Ritiro e Pulsanti */}
          {cart.length > 0 && (
            <div className={styles.cartFooterSection}>
              <div className={styles.cartTotalRow}>
                <span className={styles.cartTotalLabel}>Totale Complessivo:</span>
                {/* 🚀 Visualizza il totale dinamico comprensivo di costi extra */}
                <span className={styles.cartTotalValue}>€ {displayTotal.toFixed(2)}</span>
              </div>

              <OrderTypeSelector 
                selectedType={orderType}
                onSelectType={setOrderType}
                additionalInfo={additionalInfo}
                onInfoChange={handleInfoChange}
              />

              {/* Sezione dedicata ai Coperti visibile solo se l'utente sceglie il servizio al tavolo */}
              {orderType === 'table' && (
                <div className={styles.customQuantityBox} style={{ marginTop: '0.75rem' }}>
                  <label className={styles.customLabel}>
                    👥 Numero di Coperti (Costo coperto a persona):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={additionalInfo.covers}
                    onChange={(e) => handleInfoChange('covers', e.target.value)}
                    className={styles.customTextarea}
                    style={{ textAlign: 'center', fontWeight: 'bold' }}
                  />
                </div>
              )}

              {hasOnlyFixedTime ? (
                <div className={`${styles.cartItemCard} ${styles.fixedTimeBanner}`}>
                  <p className={styles.fixedTimeText}>
                    ⚡ L'ordine sarà pronto tra {fixedMinutes} minut{fixedMinutes === 1 ? 'o' : 'i'}
                  </p>
                </div>
              ) : (
                <div className={`${styles.customQuantityBox} ${styles.pickupSlotContainer}`}>
                  <label className={`${styles.customLabel} ${styles.pickupSlotLabel}`}>
                    🕒 Intervallo di Ritiro Previsto:
                  </label>
                  <select 
                    value={pickupTime} 
                    onChange={(e) => setPickupTime(e.target.value)}
                    className={styles.customTextarea}
                  >
                    {availablePickupSlots && availablePickupSlots.length > 0 ? (
                      availablePickupSlots.map((slot, index) => (
                        <option key={`${slot}-${index}`} value={slot}>
                          {calculateTimeRange(slot)} {index === 0 ? '⭐ (Primo disponibile)' : ''}
                        </option>
                      ))
                    ) : (
                      <option value="ASAP">Nessuno slot disponibile o locale chiuso</option>
                    )}
                  </select>
                </div>
              )}

              <div className={styles.customActionButtonsRow}>
                <button onClick={onClose} className={styles.customSecondaryButton}>
                  Continua gli acquisti
                </button>

                <button 
                  onClick={async () => {
                    if (!user || isSubmitting) return; 
                    setIsSubmitting(true);
                    setCartError(null);

                    if (orderType === 'table') {
                      const tableNum = parseInt(additionalInfo.tableNumber, 10);
                      if (!additionalInfo.tableNumber || isNaN(tableNum) || tableNum <= 0) {
                        setCartError('Inserisci un numero di tavolo valido.');
                        setIsSubmitting(false);
                        return;
                      }
                    } else if (orderType === 'delivery') {
                      if (!additionalInfo.deliveryAddress || additionalInfo.deliveryAddress.trim() === '') {
                        setCartError('Inserisci un indirizzo di consegna valido.');
                        setIsSubmitting(false);
                        return;
                      }
                    }

                    try {
                      const finalSlot = pickupTime || (availablePickupSlots.length > 0 ? availablePickupSlots[0] : "19:00");

                      // 🚀 Validazione di sicurezza contro le eccezioni del calendario prima di inviare
                      const currentDateStr = new Date().toISOString();
                      const calendarCheck = validateCalendarAndSchedule(currentDateStr, finalSlot);

                      if (!calendarCheck.isValid) {
                        setCartError(calendarCheck.error || 'Il locale è chiuso in questa data.');
                        setIsSubmitting(false);
                        return;
                      }

                      const orderMeta = {
                        orderType,
                        tableNumber: orderType === 'table' ? additionalInfo.tableNumber : null,
                        deliveryAddress: orderType === 'delivery' ? additionalInfo.deliveryAddress : null,
                        covers: orderType === 'table' ? parseInt(additionalInfo.covers, 10) || 1 : null,
                      };

                      const result = await sendOrder(user.name || "Cliente", finalSlot, orderMeta);

                      if (!result) {
                        return; 
                      }

                      if (typeof result === 'string' && result.startsWith('ERRORE:')) {
                        setCartError(result.replace('ERRORE:', '').trim());
                        return;
                      }

                      setConfirmedOrder({
                        id: result,
                        customerName: user.name || "Cliente",
                        pickupTime: finalSlot,
                        totalPrice: displayTotal, // 🚀 Salva il totale effettivo con i supplementi
                        orderType,
                        tableNumber: orderMeta.tableNumber,
                        deliveryAddress: orderMeta.deliveryAddress,
                        covers: orderMeta.covers,
                        items: [...cart]
                      });
                    } finally {
                      setIsSubmitting(false); 
                    }
                  }}
                  disabled={!user || isSubmitting}
                  className={`${styles.customPrimaryButton} ${(!user || isSubmitting) ? styles.productButtonDisabled : ''}`}
                >
                  {isSubmitting ? 'Invio in corso...' : (user ? '🚀 Invia al Pizzaiolo' : '🔒 Accedi per Ordinare')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <OrderConfirmationModal 
        isOpen={Boolean(confirmedOrder)} 
        onClose={() => {
          setConfirmedOrder(null);
          onClose(); 
        }} 
        orderData={confirmedOrder} 
      />
    </>
  ); 
}