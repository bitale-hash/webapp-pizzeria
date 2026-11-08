//components/admin/settings/ProductionDepartmentCard.tsx

'use client';

import React, { useState } from 'react';
import styles from './AdminSettings.module.css';

interface Props {
  departments: any[];
  onRefresh: () => void;
}

export default function ProductionDepartmentCard({ departments, onRefresh }: Props) {
  const [name, setName] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [fixedTimeMinutes, setFixedTimeMinutes] = useState('');
  const [saving, setSaving] = useState(false);

  // Tempo ciclo fisso a 15 minuti
  const cycleTimeMinutes = 15;

  // Conta quanti reparti di produzione normali (senza tempo fisso) esistono già
  const productionDeptsCount = departments.filter(d => !d.fixedTimeMinutes).length;
  const isMaxProductionDeptsReached = productionDeptsCount >= 2;

  const isUsingFixedTime = Boolean(fixedTimeMinutes.trim());
  const isUsingCycle = Boolean(maxCapacity.trim());

  const handleCreateDepartment = async () => {
    if (!name) return;

    // Se sta tentando di creare un reparto di produzione (senza tempo fisso) ma il limite è raggiunto
    if (!isUsingFixedTime && isMaxProductionDeptsReached) {
      alert('⚠️ Hai già raggiunto il limite massimo di 2 reparti di produzione. Puoi aggiungere solo reparti a tempo fisso (es. Bevande).');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
          cycleTimeMinutes: isUsingFixedTime ? null : cycleTimeMinutes,
          fixedTimeMinutes: fixedTimeMinutes ? parseInt(fixedTimeMinutes) : null,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setName('');
        setMaxCapacity('');
        setFixedTimeMinutes('');
        onRefresh();
      } else {
        alert(result.error || 'Errore nella creazione del reparto');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo reparto? Le categorie associate torneranno senza reparto.')) return;

    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        onRefresh();
      } else {
        alert(result.error || "Errore durante l'eliminazione");
      }
    } catch (err) {
      console.error('Errore eliminazione reparto:', err);
    }
  };

  return (
    <div className={styles.cardBox}>
      <h2 className={styles.cardTitle}>🏭 Reparti</h2>

      {isMaxProductionDeptsReached && (
        <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', padding: '10px 15px', borderRadius: '8px', marginBottom: '1rem', color: '#60a5fa', fontSize: '0.9rem' }}>
          ℹ️ Hai raggiunto il limite di <strong>2 reparti di produzione</strong>. Puoi comunque continuare a creare quanti reparti a <strong>Tempo Fisso</strong> desideri (es. Bevande).
        </div>
      )}

      {/* Form di creazione */}
      <div className={styles.formGrid}>
        <div>
          <label className={styles.dayLabel}>Nome Reparto</label>
          <input 
            type="text" 
            placeholder="Es. Panini, Bevande..." 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className={styles.inputField}
          />
        </div>
        <div>
          <label className={styles.dayLabel}>Capacità Max per ciclo</label>
          <input 
            type="number" 
            placeholder="Es. 10" 
            value={maxCapacity} 
            onChange={e => setMaxCapacity(e.target.value)} 
            disabled={isUsingFixedTime || isMaxProductionDeptsReached}
            className={styles.ovenCapacityInput}
            style={{ width: '100%', opacity: (isUsingFixedTime || isMaxProductionDeptsReached) ? 0.5 : 1 }}
          />
        </div>
        <div>
          <label className={styles.dayLabel}>Tempo Ciclo (min)</label>
          <input 
            type="number" 
            value={cycleTimeMinutes} 
            disabled 
            className={styles.ovenCapacityInput}
            style={{ width: '100%', opacity: 0.7, cursor: 'not-allowed' }}
          />
        </div>
        <div>
          <label className={styles.dayLabel}>Oppure Tempo Fisso (min)</label>
          <input 
            type="number" 
            placeholder="Es. 1" 
            value={fixedTimeMinutes} 
            onChange={e => setFixedTimeMinutes(e.target.value)} 
            disabled={isUsingCycle}
            className={styles.ovenCapacityInput}
            style={{ width: '100%', opacity: isUsingCycle ? 0.5 : 1 }}
          />
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button 
          type="button" 
          onClick={handleCreateDepartment} 
          disabled={saving || !name} 
          className={styles.addOvenButton}
        >
          {saving ? 'Creazione...' : 'Aggiungi Reparto ➕'}
        </button>
      </div>

      {/* Lista Reparti esistenti */}
      <h3 className={styles.sectionSubTitle}>Reparti Attivi ({departments.length})</h3>
      <div className={styles.ovensListContainer}>
        {departments.length === 0 ? (
          <p className={styles.subtitle}>Nessun reparto configurato.</p>
        ) : (
          departments.map(dept => (
            <div key={dept.id} className={styles.ovenRow}>
              <div>
                <span className={styles.ovenTitle}>{dept.name}</span>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  {dept.fixedTimeMinutes ? (
                    <span>Tempo Fisso: <strong>{dept.fixedTimeMinutes} min</strong></span>
                  ) : (
                    <span>Capacità Max: <strong>{dept.maxCapacity || 'N/D'}</strong> | Tempo Ciclo: <strong>15 min</strong></span>
                  )}
                </div>
              </div>
              <div className={styles.ovenControls}>
                <button type="button" onClick={() => handleDeleteDepartment(dept.id)} className={styles.deleteOvenButton}>
                  Elimina 🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}