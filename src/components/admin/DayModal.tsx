// components/admin/DayModal.tsx (o il percorso corretto del tuo file admin)
'use client';

import styles from '../panoramica.module.css';

interface CalendarException {
  id?: number;
  date: string;
  isClosed: boolean;
  hasLunch: boolean;
  lunchOpen?: string | null;
  lunchClose?: string | null;
  hasDinner: boolean;
  dinnerOpen?: string | null;
  dinnerClose?: string | null;
  reason?: string | null;
}

interface DayModalProps {
  selectedDayModal: CalendarException;
  setSelectedDayModal: (day: CalendarException | null) => void;
  onSave: (finalData: CalendarException) => void;
}

export default function DayModal({ selectedDayModal, setSelectedDayModal, onSave }: DayModalProps) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionHeading}>Configura Giorno: {selectedDayModal.date}</h3>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const isCurrentlyClosed = !selectedDayModal.hasLunch && !selectedDayModal.hasDinner;
            
            // 🚀 Assicura che se i turni sono attivi ma gli orari sono vuoti/null, vengano salvati i default
            const finalData = { 
              ...selectedDayModal, 
              isClosed: isCurrentlyClosed,
              lunchOpen: selectedDayModal.hasLunch ? (selectedDayModal.lunchOpen || '12:00') : null,
              lunchClose: selectedDayModal.hasLunch ? (selectedDayModal.lunchClose || '15:00') : null,
              dinnerOpen: selectedDayModal.hasDinner ? (selectedDayModal.dinnerOpen || '19:00') : null,
              dinnerClose: selectedDayModal.hasDinner ? (selectedDayModal.dinnerClose || '23:00') : null,
            };

            onSave(finalData);
          }}
          className={styles.flexColumnGap}
        >
          {/* Checkbox Pranzo */}
          <div className={styles.metricCard}>
            <label className={styles.flexAlignCenter} style={{ cursor: 'pointer', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={selectedDayModal.hasLunch}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSelectedDayModal({ 
                    ...selectedDayModal, 
                    hasLunch: checked,
                    lunchOpen: checked ? (selectedDayModal.lunchOpen || '12:00') : selectedDayModal.lunchOpen,
                    lunchClose: checked ? (selectedDayModal.lunchClose || '15:00') : selectedDayModal.lunchClose
                  });
                }}
              />
              <span className={styles.boldText}>Apertura Pranzo</span>
            </label>
            {selectedDayModal.hasLunch && (
              <div className={styles.consumptionDetailsRow}>
                <input
                  type="time"
                  value={selectedDayModal.lunchOpen || '12:00'}
                  onChange={(e) => setSelectedDayModal({ ...selectedDayModal, lunchOpen: e.target.value })}
                  className={styles.quantityInput}
                  style={{ width: '110px' }}
                />
                <span>-</span>
                <input
                  type="time"
                  value={selectedDayModal.lunchClose || '15:00'}
                  onChange={(e) => setSelectedDayModal({ ...selectedDayModal, lunchClose: e.target.value })}
                  className={styles.quantityInput}
                  style={{ width: '110px' }}
                />
              </div>
            )}
          </div>

          {/* Checkbox Cena */}
          <div className={styles.metricCard}>
            <label className={styles.flexAlignCenter} style={{ cursor: 'pointer', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={selectedDayModal.hasDinner}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSelectedDayModal({ 
                    ...selectedDayModal, 
                    hasDinner: checked,
                    dinnerOpen: checked ? (selectedDayModal.dinnerOpen || '19:00') : selectedDayModal.dinnerOpen,
                    dinnerClose: checked ? (selectedDayModal.dinnerClose || '23:00') : selectedDayModal.dinnerClose
                  });
                }}
              />
              <span className={styles.boldText}>Apertura Cena</span>
            </label>
            {selectedDayModal.hasDinner && (
              <div className={styles.consumptionDetailsRow}>
                <input
                  type="time"
                  value={selectedDayModal.dinnerOpen || '19:00'}
                  onChange={(e) => setSelectedDayModal({ ...selectedDayModal, dinnerOpen: e.target.value })}
                  className={styles.quantityInput}
                  style={{ width: '110px' }}
                />
                <span>-</span>
                <input
                  type="time"
                  value={selectedDayModal.dinnerClose || '23:00'}
                  onChange={(e) => setSelectedDayModal({ ...selectedDayModal, dinnerClose: e.target.value })}
                  className={styles.quantityInput}
                  style={{ width: '110px' }}
                />
              </div>
            )}
          </div>

          {!selectedDayModal.hasLunch && !selectedDayModal.hasDinner && (
            <div className={styles.messageBoxError} style={{ fontSize: '0.85rem' }}>
              ⚠️ Nessun turno selezionato: il locale risulterà CHIUSO in questa giornata.
            </div>
          )}

          {/* Motivazione */}
          <div className={styles.flexColumnGap} style={{ gap: '0.35rem' }}>
            <label className={styles.unitLabel}>Nota / Motivo:</label>
            <input
              type="text"
              placeholder="Es. Festività, Ferie..."
              value={selectedDayModal.reason || ''}
              onChange={(e) => setSelectedDayModal({ ...selectedDayModal, reason: e.target.value })}
              className={styles.quantityInput}
              style={{ width: '100%', textAlign: 'left', padding: '0.5rem' }}
            />
          </div>

          {/* Bottoni azione */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => setSelectedDayModal(null)}
              className={styles.categoryTabBtn}
            >
              Annulla
            </button>
            <button
              type="submit"
              className={styles.saveButton}
            >
              Salva Modifiche
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}