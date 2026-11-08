//components/admin/settings/OpeningHoursCard.tsx

import styles from './AdminSettings.module.css';

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

interface Props {
  schedule: { [key: string]: DaySchedule };
  handleDayChange: (dayKey: string, field: keyof DaySchedule, value: any) => void;
}

export default function OpeningHoursCard({ schedule, handleDayChange }: Props) {
  return (
    <div className={styles.cardBox}>
      <h3 className={styles.cardTitle}>Orari di Apertura per Giorno e Turno</h3>
      
      {DAYS_OF_WEEK.map(({ key, label }) => {
        const dayData = schedule[key] || { 
          hasLunch: false, lunchOpen: '12:00', lunchClose: '15:00', 
          hasDinner: false, dinnerOpen: '19:00', dinnerClose: '23:00' 
        };
        
        return (
          <div key={key} className={styles.dayScheduleRow}>
            <span className={styles.dayLabel}>{label}</span>

            <div className={styles.shiftsGrid}>
              
              {/* TURNO PRANZO */}
              <div className={styles.shiftBox}>
                <label className={styles.shiftLabel}>
                  <input 
                    type="checkbox" 
                    checked={dayData.hasLunch} 
                    onChange={(e) => handleDayChange(key, 'hasLunch', e.target.checked)}
                    className={styles.checkboxInput}
                  />
                  Aperto a Pranzo
                </label>

                {dayData.hasLunch && (
                  <div className={styles.timeInputsContainer}>
                    <input 
                      type="time" 
                      value={dayData.lunchOpen} 
                      onChange={(e) => handleDayChange(key, 'lunchOpen', e.target.value)}
                      className={styles.timeInput}
                    />
                    <span className={styles.timeSeparator}>-</span>
                    <input 
                      type="time" 
                      value={dayData.lunchClose} 
                      onChange={(e) => handleDayChange(key, 'lunchClose', e.target.value)}
                      className={styles.timeInput}
                    />
                  </div>
                )}
              </div>

              {/* TURNO CENA */}
              <div className={styles.shiftBox}>
                <label className={styles.shiftLabel}>
                  <input 
                    type="checkbox" 
                    checked={dayData.hasDinner} 
                    onChange={(e) => handleDayChange(key, 'hasDinner', e.target.checked)}
                    className={styles.checkboxInput}
                  />
                  Aperto a Cena
                </label>

                {dayData.hasDinner && (
                  <div className={styles.timeInputsContainer}>
                    <input 
                      type="time" 
                      value={dayData.dinnerOpen} 
                      onChange={(e) => handleDayChange(key, 'dinnerOpen', e.target.value)}
                      className={styles.timeInput}
                    />
                    <span className={styles.timeSeparator}>-</span>
                    <input 
                      type="time" 
                      value={dayData.dinnerClose} 
                      onChange={(e) => handleDayChange(key, 'dinnerClose', e.target.value)}
                      className={styles.timeInput}
                    />
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}