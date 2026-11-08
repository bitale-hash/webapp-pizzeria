'use client';

import { useState, useEffect } from 'react';
import styles from './panoramica.module.css';
import DayModal from './sub-components/DayModal'; // Importa il modale separato

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

export default function CalendarManager() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [exceptions, setExceptions] = useState<CalendarException[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDayModal, setSelectedDayModal] = useState<CalendarException | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [resCal, resSet] = await Promise.all([
          fetch('/api/calendar'),
          fetch('/api/settings')
        ]);

        const dataCal = await resCal.json();
        const dataSet = await resSet.json();

        if (dataCal.success) setExceptions(dataCal.exceptions);
        if (dataSet.success) setSettings(dataSet.settings);
      } catch (error) {
        console.error('Errore caricamento dati:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const getDayData = (dateString: string, dayOfWeekIndex: number): CalendarException => {
    const found = exceptions.find((ex) => ex.date === dateString);
    if (found) return found;

    const daysMap = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayKey = daysMap[dayOfWeekIndex];

    let standardConfig = {
      hasLunch: true,
      lunchOpen: '12:00',
      lunchClose: '15:00',
      hasDinner: true,
      dinnerOpen: '19:00',
      dinnerClose: '23:00',
    };

    const rawSchedule = settings[`schedule_${dayKey}`];
    if (rawSchedule) {
      try {
        const parsed = JSON.parse(rawSchedule);
        standardConfig = {
          hasLunch: parsed.hasLunch ?? true,
          lunchOpen: parsed.lunchOpen || '12:00',
          lunchClose: parsed.lunchClose || '15:00',
          hasDinner: parsed.hasDinner ?? true,
          dinnerOpen: parsed.dinnerOpen || '19:00',
          dinnerClose: parsed.dinnerClose || '23:00',
        };
      } catch (e) {
        console.error(`Errore parsing JSON per schedule_${dayKey}:`, e);
      }
    }

    const isClosedStandard = !standardConfig.hasLunch && !standardConfig.hasDinner;

    return {
      date: dateString,
      isClosed: isClosedStandard,
      hasLunch: standardConfig.hasLunch,
      lunchOpen: standardConfig.lunchOpen,
      lunchClose: standardConfig.lunchClose,
      hasDinner: standardConfig.hasDinner,
      dinnerOpen: standardConfig.dinnerOpen,
      dinnerClose: standardConfig.dinnerClose,
      reason: '',
    };
  };

  const handleSaveModal = async (finalData: CalendarException) => {
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      const data = await res.json();
      if (data.success) {
        setExceptions((prev) => {
          const filtered = prev.filter((item) => item.date !== finalData.date);
          return [...filtered, data.exception];
        });
        setSelectedDayModal(null);
      }
    } catch (error) {
      console.error('Errore salvataggio:', error);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' });

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  let startDayIndex = firstDayOfMonth.getDay() - 1;
  if (startDayIndex === -1) startDayIndex = 6; 

  const calendarCells = [];

  for (let i = 0; i < startDayIndex; i++) {
    calendarCells.push(<div key={`empty-${i}`} className={styles.calendarEmptyCell}></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayFormatted = String(day).padStart(2, '0');
    const monthFormatted = String(month + 1).padStart(2, '0');
    const dateString = `${year}-${monthFormatted}-${dayFormatted}`;

    const currentLoopDate = new Date(year, month, day);
    let jsDay = currentLoopDate.getDay() - 1;
    if (jsDay === -1) jsDay = 6;

    const dayData = getDayData(dateString, jsDay);
    const isEffectivelyClosed = dayData.isClosed || (!dayData.hasLunch && !dayData.hasDinner);

    calendarCells.push(
      <div
        key={dateString}
        onClick={() => setSelectedDayModal(dayData)}
        className={`${styles.calendarCell} ${isEffectivelyClosed ? styles.calendarCellClosed : styles.calendarCellOpen}`}
      >
        <div className={styles.calendarCellHeader}>
          <span>{day}</span>
          <span className={isEffectivelyClosed ? styles.statusRed : styles.statusGreen}>
            {isEffectivelyClosed ? 'Chiuso' : 'Aperto'}
          </span>
        </div>

        {!isEffectivelyClosed && (
          <div className={styles.calendarCellShifts}>
            {dayData.hasLunch && <div>Pranzo</div>}
            {dayData.hasDinner && <div>Cena</div>}
          </div>
        )}

        {dayData.reason && (
          <div className={styles.calendarCellReason} title={dayData.reason}>
            📝 {dayData.reason}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Caricamento calendario...</p>
      </div>
    );
  }

  return (
    
      <div className={styles.ingredientsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionHeading} style={{ textTransform: 'capitalize' }}>
            📅 {monthName}
          </h2>
          <div className={styles.periodSelectorContainer}>
            <button onClick={prevMonth} className={styles.categoryTabBtn}>▲ Mese Precedente</button>
            <button onClick={nextMonth} className={styles.categoryTabBtn}>Mese Successivo ▼</button>
          </div>
        </div>

        <div className={styles.calendarWeekHeader}>
          <div>lu</div><div>ma</div><div>me</div><div>gi</div><div>ve</div><div>sa</div><div>do</div>
        </div>

        <div className={styles.calendarGrid}>
          {calendarCells}
        </div>

        {/* Modale estratto nel componente dedicato */}
        {selectedDayModal && (
          <DayModal
            selectedDayModal={selectedDayModal}
            setSelectedDayModal={setSelectedDayModal}
            onSave={handleSaveModal}
          />
        )}
      </div>

     
    
  );
}