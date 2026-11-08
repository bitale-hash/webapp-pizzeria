'use client';

import React, { useState, useEffect } from 'react';
import OpeningHoursCard from '../../../components/admin/settings/OpeningHoursCard';
import CompletedOrdersCleanupCard from '../../../components/admin/settings/CompletedOrdersCleanupCard';
import ConfirmModal from '../../../components/ConfirmModal';
import ProductionDepartmentCard from '../../../components/admin/settings/ProductionDepartmentCard';
import OrderTypesManager from '../../../components/admin/settings/OrderTypesManager';

import styles from '../../../components/admin/settings/AdminSettings.module.css';

interface DaySchedule {
  hasLunch: boolean;
  lunchOpen: string;
  lunchClose: string;
  hasDinner: boolean;
  dinnerOpen: string;
  dinnerClose: string;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Lunedì' },
  { key: 'tuesday', label: 'Martedì' },
  { key: 'wednesday', label: 'Mercoledì' },
  { key: 'thursday', label: 'Giovedì' },
  { key: 'friday', label: 'Venerdì' },
  { key: 'saturday', label: 'Sabato' },
  { key: 'sunday', label: 'Domenica' },
];

export default function AdminSettingsPage() {
  const [completedOrdersRetentionHours, setCompletedOrdersRetentionHours] = useState<number>(24);
  const [departments, setDepartments] = useState<any[]>([]);

  const [orderTypes, setOrderTypes] = useState({
    enableCounterPickup: true,
    enableTableService: true,
    enableDelivery: true,
    tableServiceFee: 1.50,  
    deliveryFee: 2.50,     
    minDeliveryOrder: 15.00,
    totalTables: 20,
    maxDeliveryDistance: 5.0, // 👈 Aggiunto campo distanza massima consegna
  });

  const [schedule, setSchedule] = useState<{ [key: string]: DaySchedule }>({
    monday: { hasLunch: false, lunchOpen: '12:00', lunchClose: '15:00', hasDinner: false, dinnerOpen: '19:00', dinnerClose: '23:00' },
    tuesday: { hasLunch: false, lunchOpen: '12:00', lunchClose: '15:00', hasDinner: true, dinnerOpen: '19:00', dinnerClose: '23:00' },
    wednesday: { hasLunch: false, lunchOpen: '12:00', lunchClose: '15:00', hasDinner: true, dinnerOpen: '19:00', dinnerClose: '23:00' },
    thursday: { hasLunch: false, lunchOpen: '12:00', lunchClose: '15:00', hasDinner: true, dinnerOpen: '19:00', dinnerClose: '23:00' },
    friday: { hasLunch: false, lunchOpen: '12:00', lunchClose: '15:00', hasDinner: true, dinnerOpen: '19:00', dinnerClose: '23:30' },
    saturday: { hasLunch: false, lunchOpen: '12:00', lunchClose: '15:00', hasDinner: true, dinnerOpen: '19:00', dinnerClose: '23:30' },
    sunday: { hasLunch: false, lunchOpen: '12:00', lunchClose: '15:00', hasDinner: true, dinnerOpen: '19:00', dinnerClose: '23:30' },
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      if (data.success) setDepartments(data.data);
    } catch (error) {
      console.error('Errore caricamento reparti:', error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant?: 'danger' | 'primary';
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'primary',
  });

  // Caricamento impostazioni generali
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          const settings = data.settings;
          
          const loadedSchedule = { ...schedule };
          DAYS_OF_WEEK.forEach(({ key }) => {
            if (settings[`schedule_${key}`]) {
              try {
                loadedSchedule[key] = JSON.parse(settings[`schedule_${key}`]);
              } catch (e) {
                console.error(`Errore parsing orari per ${key}`, e);
              }
            }
          });
          setSchedule(loadedSchedule);

          if (settings.completed_orders_retention_hours) {
            setCompletedOrdersRetentionHours(Number(settings.completed_orders_retention_hours));
          }

          // Carica la configurazione unificata dei tipi di ordine da JSON
          if (settings.order_types_config) {
            try {
              const parsedConfig = JSON.parse(settings.order_types_config);
              setOrderTypes({
                enableCounterPickup: parsedConfig.enableCounterPickup ?? true,
                enableTableService: parsedConfig.enableTableService ?? true,
                enableDelivery: parsedConfig.enableDelivery ?? true,
                tableServiceFee: parsedConfig.tableServiceFee ?? 1.50,
                deliveryFee: parsedConfig.deliveryFee ?? 2.50,
                minDeliveryOrder: parsedConfig.minDeliveryOrder ?? 15.00,
                totalTables: parsedConfig.totalTables ?? 20,
                maxDeliveryDistance: parsedConfig.maxDeliveryDistance ?? 5.0,
              });
            } catch (e) {
              console.error('Errore parsing order_types_config', e);
            }
          } else {
            // Fallback temporaneo se la chiave unificata non è ancora sul DB
            setOrderTypes({
              enableCounterPickup: settings.enable_counter_pickup !== 'false',
              enableTableService: settings.enable_table_service !== 'false',
              enableDelivery: settings.enable_delivery !== 'false',
              tableServiceFee: settings.table_service_fee ? parseFloat(settings.table_service_fee) : 1.50,
              deliveryFee: settings.delivery_fee ? parseFloat(settings.delivery_fee) : 2.50,
              minDeliveryOrder: settings.min_delivery_order ? parseFloat(settings.min_delivery_order) : 15.00,
              totalTables: settings.total_tables ? parseInt(settings.total_tables) : 20,
              maxDeliveryDistance: settings.max_delivery_distance ? parseFloat(settings.max_delivery_distance) : 5.0,
            });
          }
        }
      })
      .catch((err) => {
        console.error('Errore caricamento impostazioni:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleDayChange = (dayKey: string, field: keyof DaySchedule, value: any) => {
    setSchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value
      }
    }));
  };

  const handleOrderTypeChange = (field: string, value: boolean | number) => {
    setOrderTypes((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, string> = {};

      DAYS_OF_WEEK.forEach(({ key }) => {
        payload[`schedule_${key}`] = JSON.stringify(schedule[key]);
      });

      payload['completed_orders_retention_hours'] = String(completedOrdersRetentionHours);
      
      // 🚀 UNICA RIGA JSON PER I TIPI DI ORDINE E COSTI
      payload['order_types_config'] = JSON.stringify(orderTypes);

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setModalConfig({
          isOpen: true,
          title: 'Salvataggio completato',
          message: 'Tutte le impostazioni sono state salvate con successo!',
          variant: 'primary',
        });
      } else {
        setModalConfig({
          isOpen: true,
          title: 'Errore',
          message: 'Errore durante il salvataggio delle impostazioni.',
          variant: 'danger',
        });
      }
    } catch (error) {
      console.error(error);
      setModalConfig({
        isOpen: true,
        title: 'Errore di connessione',
        message: 'Impossibile comunicare con il server durante il salvataggio.',
        variant: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <h2>Caricamento impostazioni in corso...</h2>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>⚙️ Impostazioni Generali</h1>
      <p className={styles.subtitle}>
        Configura i turni di apertura, i reparti, le regole di pulizia e le opzioni di ritiro degli ordini.
      </p>

      <form onSubmit={handleSave} className={styles.form}>
        <OpeningHoursCard schedule={schedule} handleDayChange={handleDayChange} />

        {/* Gestione Reparti di Produzione */}
        <ProductionDepartmentCard 
          departments={departments}
          onRefresh={fetchDepartments}
        />

        <CompletedOrdersCleanupCard 
          retentionHours={completedOrdersRetentionHours}
          setRetentionHours={setCompletedOrdersRetentionHours}
        />

        {/* Gestione Tipi di Ritiro integrata nel form */}
        <OrderTypesManager 
          orderTypes={orderTypes}
          onChange={handleOrderTypeChange}
        />

        <button
          type="submit"
          disabled={saving}
          className={styles.saveButton}
          style={{ marginTop: '2rem' }}
        >
          {saving ? 'Salvataggio in corso...' : 'Salva Tutte le Modifiche'}
        </button>
      </form>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText="Capito"
        onConfirm={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        variant={modalConfig.variant}
      />
    </div>
  );
}