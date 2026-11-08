//context/CartContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useOrders } from './OrderContext';
import { usePizzeria } from './PizzeriaContext';

export interface CartItem {
  id: string;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  notes: string;
  extras: { id: number; name: string; price: number }[];
  categorySlug?: string;
  categoryId?: number;
  category_id?: number;
  departmentId?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  cartError: string | null;
  setCartError: React.Dispatch<React.SetStateAction<string | null>>;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalPrice: number;
  calculateFinalTotal: (orderType: string, covers: number) => Promise<number>; // 👈 Metodo per calcolare il totale con le tariffe
  sendOrder: (customerName: string, selectedPickupTime?: string, orderMeta?: { orderType: string; tableNumber: string | null; deliveryAddress: string | null; covers?: number | null }) => Promise<string | number | null | undefined>;
  availablePickupSlots: string[];
  getItemDepartment: (item: any) => { deptId: string | number; maxCapacity: number; isIgnored: boolean; fixedTimeMinutes?: number };
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const DAYS_MAPPING = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { generateDailyOrderId, orders, setOrders } = useOrders();
  const { menu, categories, ingredients } = usePizzeria();
  const [departments, setDepartments] = useState<any[]>([]);
  const [availablePickupSlots, setAvailablePickupSlots] = useState<string[]>([]);
  const [cartError, setCartError] = useState<string | null>(null);

  // Carica i reparti dinamici dal backend
  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setDepartments(data.data);
        }
      })
      .catch(err => console.error("❌ Errore caricamento reparti:", err));
  }, [orders]);

  const getItemDepartment = (item: any): { deptId: string | number; maxCapacity: number; isIgnored: boolean; fixedTimeMinutes?: number } => {
    let name = '';
    let catId = 0;
    let deptId: number | string = 0;
    let catSlug = '';

    if (typeof item === 'string') {
      name = item.toLowerCase();
    } else {
      catId = Number(item.categoryId || item.category_id || item.product?.categoryId);
      deptId = Number(item.departmentId || item.department_id || item.product?.category?.departmentId);
      catSlug = ((item.categorySlug || item.category || item.product?.category?.slug) || '').toLowerCase();
      name = (item.name || '').toLowerCase();

      if ((!catId || isNaN(catId) || !catSlug) && item.productId && menu.length > 0) {
        const foundProduct = menu.find(p => p.id === Number(item.productId));
        if (foundProduct) {
          catSlug = (foundProduct.category || '').toLowerCase();
          name = (foundProduct.name || name).toLowerCase();
          const foundCat = categories.find(c => c.slug.toLowerCase() === catSlug);
          if (foundCat) {
            catId = foundCat.id;
            if (foundCat.departmentId) deptId = foundCat.departmentId;
          }
        }
      }

      if (catId && categories.length > 0) {
        const foundCat = categories.find(c => c.id === catId);
        if (foundCat) {
          if (foundCat.departmentId) deptId = foundCat.departmentId;
          if (foundCat.slug) catSlug = foundCat.slug.toLowerCase();
        }
      }
    }

    let determinedDeptKey: string | number = deptId;
    let defaultMaxCap = 10;
    let isIgnored = false;

    if (
      deptId === 4 || catId === 4 || 
      name.includes('acqua') || name.includes('cola') || name.includes('birra') || 
      name.includes('fanta') || name.includes('sprite') || name.includes('vino') || 
      name.includes('coca') || name.includes('bibita') || catSlug.includes('bevande')
    ) {
      return { deptId: 'bevande_ignored', maxCapacity: 1, isIgnored: true, fixedTimeMinutes: 1 };
    }

    if (
      deptId === 6 || deptId === 5 || catId === 2 || catId === 3 ||
      name.includes('panino') || name.includes('hamburger') || name.includes('humburger') || 
      name.includes('burger') || name.includes('cheeseburger') || name.includes('sandwich') ||
      name.includes('fritto') || name.includes('fritta') || name.includes('patatine') || 
      name.includes('crocchè') || name.includes('crocche') || name.includes('supplì') || 
      name.includes('suppli') || name.includes('arancino') || name.includes('olive ascolane') ||
      catSlug.includes('panini') || catSlug.includes('fritti')
    ) {
      determinedDeptKey = departments.find(d => d.name.toLowerCase().includes('panini') || d.name.toLowerCase().includes('fritti'))?.id || 6;
      defaultMaxCap = 5;
    } else {
      determinedDeptKey = departments.find(d => d.name.toLowerCase().includes('pizze'))?.id || 3;
      defaultMaxCap = 10;
    }

    const matchedDept = departments.find(d => Number(d.id) === Number(determinedDeptKey) || d.name.toLowerCase() === String(determinedDeptKey).toLowerCase());
    const maxCapacity = matchedDept ? (Number(matchedDept.maxCapacity) || Number(matchedDept.max_capacity) || defaultMaxCap) : defaultMaxCap;
    const finalDeptId = matchedDept ? matchedDept.id : determinedDeptKey;
    const fixedVal = matchedDept ? Number(matchedDept.fixedTimeMinutes || matchedDept.fixed_time_minutes || 0) : 0;

    return { deptId: finalDeptId, maxCapacity, isIgnored, fixedTimeMinutes: fixedVal };
  };

  const getItemQuantity = (item: any): number => {
    if (typeof item === 'string') {
      const match = item.match(/^(\d+)x/);
      return match ? parseInt(match[1], 10) : 1;
    }
    return Number(item.quantity) || 1;
  };

  const computePoolsSlotsState = (
    currentOrders: any[],
    extraCart?: CartItem[],
    extraPickupTime?: string
  ) => {
    const poolsState: Record<string, Record<string, { occupate: number; libere: number }>> = {};

    const getPoolSlot = (timeStr: string, deptKey: string, defaultCap: number = 10) => {
      if (!poolsState[timeStr]) poolsState[timeStr] = {};
      if (!poolsState[timeStr][deptKey]) {
        const dept = departments.find(d => String(d.id) === String(deptKey));
        const maxCap = dept ? (Number(dept.maxCapacity) || Number(dept.max_capacity) || defaultCap) : defaultCap;

        poolsState[timeStr][deptKey] = { 
          occupate: 0,
          libere: maxCap 
        };
      }
      return poolsState[timeStr][deptKey];
    };

    const applyToPoolSlotLimited = (deptKey: string, maxCap: number, quantity: number, pickupSlot: string) => {
      let remaining = quantity;
      const [sh, sm] = pickupSlot.split(':').map(Number);
      const targetMins = sh * 60 + sm;
      const prevMins = targetMins - 15;

      const slotsToCheck = [targetMins];
      if (prevMins >= 0) slotsToCheck.push(prevMins);

      for (const mins of slotsToCheck) {
        if (remaining <= 0) break;
        const h = Math.floor(mins / 60) % 24;
        const m = mins % 60;
        const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

        const slot = getPoolSlot(timeStr, deptKey, maxCap);
        const libereArray = slot.libere;

        if (libereArray >= remaining) {
          slot.occupate += remaining;
          slot.libere -= remaining;
          remaining = 0;
        } else {
          const spaceToTake = libereArray;
          if (spaceToTake > 0) {
            slot.libere = 0;
            slot.occupate += spaceToTake;
            remaining -= spaceToTake;
          }
        }
      }
    };

    const chronologicalOrders = [...currentOrders].reverse();
    chronologicalOrders.forEach(order => {
      const orderItems = Array.isArray(order.items) ? order.items : [];
      orderItems.forEach((item: any) => {
        const { deptId, maxCapacity, isIgnored } = getItemDepartment(item);
        if (!isIgnored) {
          const qty = getItemQuantity(item);
          if (order.pickupTime) {
            applyToPoolSlotLimited(String(deptId), maxCapacity, qty, order.pickupTime);
          }
        }
      });
    });

    if (extraCart && extraCart.length > 0 && extraPickupTime) {
      const cartByDept: Record<string, { qty: number; maxCap: number }> = {};
      extraCart.forEach(item => {
        const { deptId, maxCapacity, isIgnored } = getItemDepartment(item);
        if (!isIgnored) {
          const key = String(deptId);
          if (!cartByDept[key]) cartByDept[key] = { qty: 0, maxCap: maxCapacity };
          cartByDept[key].qty += item.quantity;
        }
      });

      Object.entries(cartByDept).forEach(([deptKey, data]) => {
        if (data.qty > 0) {
          applyToPoolSlotLimited(deptKey, data.maxCap, data.qty, extraPickupTime);
        }
      });
    }

    return poolsState;
  };

  const canCartFitAtSlot = (currentOrders: any[], cartItems: CartItem[], targetSlot: string) => {
    const cartByDept: Record<string, { qty: number; maxCap: number }> = {};
    cartItems.forEach(item => {
      const { deptId, maxCapacity, isIgnored } = getItemDepartment(item);
      if (!isIgnored) {
        const key = String(deptId);
        if (!cartByDept[key]) cartByDept[key] = { qty: 0, maxCap: maxCapacity };
        cartByDept[key].qty += item.quantity;
      }
    });

    const basePoolsState = computePoolsSlotsState(currentOrders);

    for (const [deptKey, data] of Object.entries(cartByDept)) {
      const maxCap = data.maxCap;
      const [sh, sm] = targetSlot.split(':').map(Number);
      const targetMins = sh * 60 + sm;
      const prevMins = targetMins - 15;

      const targetSlotData = basePoolsState[targetSlot]?.[deptKey] || { occupate: 0, libere: maxCap };

      if (targetSlotData.libere <= 0) return false;

      let totalAvailableInWindow = targetSlotData.libere;

      if (prevMins >= 0) {
        const h = Math.floor(prevMins / 60) % 24;
        const m = prevMins % 60;
        const prevTimeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const prevSlotData = basePoolsState[prevTimeStr]?.[deptKey] || { occupate: 0, libere: maxCap };
        totalAvailableInWindow += prevSlotData.libere;
      }

      if (data.qty > totalAvailableInWindow) return false;
    }

    return true;
  };

  // 🚀 useEffect aggiornato per integrare le eccezioni del calendario nel calcolo degli slot
  useEffect(() => {
    const updateSlots = async () => {
      let settingsMap: Record<string, string> = {};
      let calendarExceptions: any[] = [];

      try {
        const [resSettings, resCalendar] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/calendar')
        ]);
        
        const dataSettings = await resSettings.json();
        if (dataSettings.success && dataSettings.settings) {
          settingsMap = dataSettings.settings;
        }

        const dataCalendar = await resCalendar.json();
        if (dataCalendar.success && dataCalendar.exceptions) {
          calendarExceptions = dataCalendar.exceptions;
        }
      } catch (e) {
        console.error("❌ Errore caricamento settings o calendario:", e);
      }
      
      const now = new Date();
      // Data locale pulita "YYYY-MM-DD"
      const localDateOnly = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      // 1. Cerca se c'è un'eccezione per la data odierna
      const todayException = calendarExceptions.find(ex => {
        if (!ex.date) return false;
        return ex.date.toString().split('T')[0] === localDateOnly;
      });

      let daySchedule = {
        hasLunch: false, lunchOpen: '12:00', lunchClose: '15:00',
        hasDinner: true, dinnerOpen: '18:00', dinnerClose: '23:30'
      };

      if (todayException) {
        // Se c'è un'eccezione, usiamo quella
        if (todayException.isClosed) {
          // Locale chiuso per eccezione (es. ferie)
          setAvailablePickupSlots([]);
          return;
        }
        daySchedule = {
          hasLunch: todayException.hasLunch,
          lunchOpen: todayException.lunchOpen || '12:00',
          lunchClose: todayException.lunchClose || '15:00',
          hasDinner: todayException.hasDinner,
          dinnerOpen: todayException.dinnerOpen || '18:00',
          dinnerClose: todayException.dinnerClose || '23:30'
        };
      } else {
        // Altrimenti usiamo il fallback settimanale standard
        const todayKey = DAYS_MAPPING[now.getDay()];
        if (settingsMap[`schedule_${todayKey}`]) {
          try {
            const parsed = JSON.parse(settingsMap[`schedule_${todayKey}`]);
            if (parsed.hasLunch || parsed.hasDinner) {
              daySchedule = parsed;
            }
          } catch (err) {
            console.error("Errore parsing schedule giornaliero", err);
          }
        }
      }

      if (cart.length === 0) {
        setAvailablePickupSlots([]);
        return;
      }

      const cartByDept: Record<string, number> = {};
      cart.forEach(item => {
        const { deptId, isIgnored } = getItemDepartment(item);
        if (!isIgnored) {
          const key = String(deptId);
          cartByDept[key] = (cartByDept[key] || 0) + item.quantity;
        }
      });

      const maxItems = Math.max(...Object.values(cartByDept), 0);
      const timeToMake = maxItems > 0 ? maxItems * 2 : 15;

      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const minAllowedMinutes = currentMinutes + timeToMake;

      const rawSlots: string[] = [];
      const generateRangeSlots = (openTime: string, closeTime: string) => {
        if (!openTime || !closeTime) return;
        const [openH, openM] = openTime.split(':').map(Number);
        const [closeH, closeM] = closeTime.split(':').map(Number);
        const rangeStartMinutes = openH * 60 + openM;
        const rangeEndMinutes = closeH * 60 + closeM;
        const startMinuteCalc = now.getMinutes() >= 45 ? 60 : Math.ceil(now.getMinutes() / 15) * 15;
        let loopMinutes = now.getHours() * 60 + (startMinuteCalc === 60 ? 0 : startMinuteCalc);

        if (startMinuteCalc === 60) loopMinutes += 60;
        const effectiveStartMinutes = Math.max(rangeStartMinutes, loopMinutes, Math.ceil(minAllowedMinutes / 15) * 15);
        for (let m = effectiveStartMinutes; m <= rangeEndMinutes; m += 15) {
          const h = Math.floor(m / 60) % 24;
          const min = m % 60;
          rawSlots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
        }
      };

      if (daySchedule.hasLunch) generateRangeSlots(daySchedule.lunchOpen, daySchedule.lunchClose);
      if (daySchedule.hasDinner) generateRangeSlots(daySchedule.dinnerOpen, daySchedule.dinnerClose);

      if (rawSlots.length === 0) {
        const fallbackMins = minAllowedMinutes + 15;
        const fh = Math.floor(fallbackMins / 60) % 24;
        const fm = fallbackMins % 60;
        rawSlots.push(`${String(fh).padStart(2, '0')}:${String(fm - (fm % 15)).padStart(2, '0')}`);
      }

      const validSlots: string[] = [];
      rawSlots.forEach(slotTime => {
        if (canCartFitAtSlot(orders, cart, slotTime)) {
          validSlots.push(slotTime);
        }
      });

      setAvailablePickupSlots(Array.from(new Set(validSlots)));
    };
    updateSlots();
  }, [cart, orders, menu, categories, departments]);

  const addToCart = (newItemData: Omit<CartItem, 'id'>) => {
    const { deptId, maxCapacity, isIgnored } = getItemDepartment(newItemData);

    if (!isIgnored) {
      const cartByDeptQty = cart.reduce((acc, item) => {
        const d = getItemDepartment(item);
        if (String(d.deptId) === String(deptId)) {
          return acc + item.quantity;
        }
        return acc;
      }, 0);

      const maxOrderLimit = maxCapacity * 2;
      if (cartByDeptQty + newItemData.quantity > maxOrderLimit) {
        alert(`⚠️ Non puoi ordinare più di ${maxOrderLimit} pezzi per questo reparto in un singolo ordine.`);
        return;
      }
    }

    setCart(prev => {
      const existingIndex = prev.findIndex(item => {
        return item.productId === newItemData.productId &&
               item.notes === newItemData.notes &&
               JSON.stringify(item.extras) === JSON.stringify(newItemData.extras);
      });
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += newItemData.quantity;
        return updated;
      } else {
        const id = `${newItemData.productId}-${Date.now()}`;
        return [...prev, { ...newItemData, id }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const clearCart = () => setCart([]);

  const totalPrice = cart.reduce((sum, item) => {
    const extrasTotal = item.extras.reduce((acc, ext) => acc + ext.price, 0);
    return sum + (item.price + extrasTotal) * item.quantity;
  }, 0);

  // 🚀 Metodo per calcolare il totale comprensivo di costi extra (coperto o consegna)
  const calculateFinalTotal = async (orderType: string, covers: number): Promise<number> => {
    let subtotal = totalPrice;
    if (subtotal <= 0) return 0;

    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings && data.settings.order_types_config) {
        const config = JSON.parse(data.settings.order_types_config);
        if (orderType === 'table') {
          const fee = Number(config.tableServiceFee) || 0;
          subtotal += fee * (covers || 1);
        } else if (orderType === 'delivery') {
          const fee = Number(config.deliveryFee) || 0;
          subtotal += fee;
        }
      }
    } catch (e) {
      console.error("Errore recupero configurazione costi per il totale:", e);
    }

    return Number(subtotal.toFixed(2));
  };

  const sendOrder = async (
    customerName: string, 
    selectedPickupTime: string = 'ASAP',
    orderMeta?: { orderType: string; tableNumber: string | null; deliveryAddress: string | null; covers?: number | null }
  ) => {
    if (cart.length === 0) return null;

    if (!availablePickupSlots || availablePickupSlots.length === 0) {
      const msg = "Il locale è attualmente chiuso o non ci sono slot disponibili.";
      setCartError(msg);
      return `ERRORE: ${msg}`;
    }

    let finalPickupTime = selectedPickupTime;
    if (selectedPickupTime === 'ASAP') {
      finalPickupTime = availablePickupSlots.length > 0 ? availablePickupSlots[0] : "19:00";
    }

    // 🚀 1. CONTROLLO SPECIFICO PER LA CONSEGNA A DOMICILIO (Indirizzo e Distanza Max)
    if (orderMeta?.orderType === 'delivery') {
      if (!orderMeta.deliveryAddress || orderMeta.deliveryAddress.trim() === '') {
        const errorMsg = "Inserisci un indirizzo di consegna valido per la consegna a domicilio.";
        setCartError(errorMsg);
        return `ERRORE: ${errorMsg}`;
      }

      try {
        const [resGeneral, resSettings] = await Promise.all([
          fetch('/api/general'),
          fetch('/api/settings')
        ]);

        const generalData = await resGeneral.json();
        const settingsData = await resSettings.json();

        let maxDeliveryDistance = 2; // Valore di fallback
        if (settingsData.success && settingsData.settings && settingsData.settings.order_types_config) {
          try {
            const config = JSON.parse(settingsData.settings.order_types_config);
            if (config.maxDeliveryDistance !== undefined) {
              maxDeliveryDistance = Number(config.maxDeliveryDistance);
            }
          } catch (e) {
            console.error("Errore parsing order_types_config", e);
          }
        }
        console.log('maxDeliveryDistance:', maxDeliveryDistance);
        const restaurantAddress = generalData?.address ? generalData.address.trim() : '';
        const customerDeliveryAddress = orderMeta.deliveryAddress.trim();

        if (restaurantAddress) {
          if (customerDeliveryAddress.toLowerCase() === restaurantAddress.toLowerCase()) {
            const errorMsg = "Non puoi inserire l'indirizzo del ristorante come indirizzo di consegna!";
            setCartError(errorMsg);
            return `ERRORE: ${errorMsg}`;
          }

          // Calcolo della distanza reale in km
          const distanceKm = await calculateDistance(restaurantAddress, customerDeliveryAddress);

          if (distanceKm > maxDeliveryDistance) {
            const errorMsg = `Ci dispiace, l'indirizzo inserito è troppo distante (${distanceKm} km). La distanza massima consentita è ${maxDeliveryDistance} km.`;
            setCartError(errorMsg);
            return `ERRORE: ${errorMsg}`;
          }
        }
      } catch (err) {
        console.error("⚠️ Errore durante il controllo della distanza di consegna:", err);
      }
    }

    const ENABLE_EXTRA_CHECKS = true; 

    if (ENABLE_EXTRA_CHECKS) {
      try {
        const resIng = await fetch('/api/ingredients');
        const ingData = await resIng.json();
        const freshIngredients = ingData.success && Array.isArray(ingData.data) ? ingData.data : [];

        for (const item of cart) {
          const targetProductId = item.productId || item.id;
          const productInMenu = menu.find(p => Number(p.id) === Number(targetProductId));

          if (productInMenu && productInMenu.ingredientIds) {
            for (const ingId of productInMenu.ingredientIds) {
              const ingredientObj = freshIngredients.find((ing: any) => Number(ing.id) === Number(ingId));
              if (ingredientObj) {
                const isAvailable = ingredientObj.inStock; 
                if (isAvailable === false || isAvailable === 0 || String(isAvailable) === 'false') {
                  const errorMessage = `Non è possibile ordinare "${item.name}": l'ingrediente "${ingredientObj.name}" è esaurito.`;
                  setCartError(errorMessage);
                  return `ERRORE: ${errorMessage}`;
                }
              }
            }
          }

          if (item.extras && item.extras.length > 0) {
            for (const extra of item.extras) {
              const ingredientObj = freshIngredients.find((ing: any) => Number(ing.id) === Number(extra.id));
              if (ingredientObj) {
                const isAvailable = ingredientObj.inStock;
                if (isAvailable === false || isAvailable === 0 || String(isAvailable) === 'false') {
                  const errorMessage = `Non è possibile ordinare "${item.name}": l'extra selezionato "${ingredientObj.name}" è esaurito.`;
                  setCartError(errorMessage);
                  return `ERRORE: ${errorMessage}`;
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("⚠️ Errore durante il controllo remoto delle scorte:", err);
      }

      if (typeof canCartFitAtSlot === 'function' && !canCartFitAtSlot(orders, cart, finalPickupTime)) {
        const slotError = `Lo slot orario selezionato (${finalPickupTime}) si è appena riempito.`;
        setCartError(slotError);
        return `ERRORE: ${slotError}`;
      }
    }

    const newOrderId = generateDailyOrderId();
    
    // Calcoliamo il totale effettivo con le tariffe prima di inviare
    const effectiveTotal = await calculateFinalTotal(
      orderMeta?.orderType || 'counter', 
      orderMeta?.covers || 1
    );

    const formattedItems = cart.map(item => {
      const extraText = item.extras && item.extras.length > 0 
        ? ` (Extra: ${item.extras.map(e => e.name).join(', ')})` 
        : '';
      const notesText = item.notes ? ` [Note: ${item.notes}]` : '';
      return `${item.quantity}x ${item.name}${extraText}${notesText}`;
    });

    // Oggetto completo pronto da inviare all'API POST /api/orders
    const newOrderPayload = {
      id: newOrderId,
      customerName,
      items: cart,
      pickupTime: finalPickupTime,
      status: 'pending',
      totalPrice: effectiveTotal, // 👈 Usa il totale calcolato comprensivo di extra
      orderType: orderMeta?.orderType || 'counter',
      tableNumber: orderMeta?.tableNumber ? Number(orderMeta.tableNumber) : null,
      deliveryAddress: orderMeta?.deliveryAddress || null,
      covers: orderMeta?.covers ? Number(orderMeta.covers) : null,
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrderPayload),
      });
      const data = await response.json();
      if (!data.success) {
        const errMsg = data.error || 'Impossibile salvare l\'ordine';
        setCartError(errMsg);
        return `ERRORE: ${errMsg}`;
      }
    } catch (error) {
      console.error("❌ Errore di rete durante il salvataggio dell'ordine:", error);
      const netError = "Errore di connessione durante l'invio dell'ordine.";
      setCartError(netError);
      return `ERRORE: ${netError}`;
    }

    const localOrderForKds = {
      id: newOrderId,
      customerName,
      items: formattedItems,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      pickupTime: finalPickupTime,
      status: 'pending' as const,
      totalPrice: effectiveTotal,
      orderType: orderMeta?.orderType || 'counter',
      tableNumber: orderMeta?.tableNumber ? Number(orderMeta.tableNumber) : null,
      deliveryAddress: orderMeta?.deliveryAddress || null,
      covers: orderMeta?.covers ? Number(orderMeta.covers) : null,
    };

    setOrders(prevOrders => [localOrderForKds, ...prevOrders]);

    clearCart();
    setCartError(null); // Pulisce eventuali errori precedenti in caso di successo
    return newOrderId;
  };;

  return (
    <CartContext.Provider value={{ cart, addToCart, cartError, setCartError, removeFromCart, updateQuantity, clearCart, totalPrice, calculateFinalTotal, sendOrder, availablePickupSlots, getItemDepartment }}>
      {children}
    </CartContext.Provider>
  );
};

const calculateDistance = async (address1: string, address2: string): Promise<number> => {
  try {
    console.log("🤖 [AI Distance] Chiedo all'AI la distanza tra:", address1, "e", address2);
    
    const response = await fetch('/api/calculate-distance-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: address1, destination: address2 }),
    });

    const data = await response.json();

    if (data.success) {
      console.log(`✅ [AI Distance] Distanza stimata dall'AI: ${data.distance} km`);
      return data.distance;
    } else {
      console.warn("⚠️ [AI Distance] Errore dal server:", data.error);
      return 0; // Fallback in caso di errore
    }
  } catch (error) {
    console.error("❌ Errore di rete nel calcolo distanza con AI:", error);
    return 0;
  }
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve essere usato all\'interno di un CartProvider');
  }
  return context;
};