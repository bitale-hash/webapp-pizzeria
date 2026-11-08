//components/chi-siamo/BookingSection.tsx
import React from 'react';
import styles from './chi-siamo.module.css';

interface Props {
  generalData: any;
  onBooking: () => void;
}

export default function BookingSection({ generalData, onBooking }: Props) {
  const bgImage = generalData.bookingBgImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4';

  return (
    <section 
      className={styles.bookingSection}
      style={{ '--booking-bg': `url(${bgImage})` } as React.CSSProperties}
    >
      <div className={styles.bookingContainer}>
        <h2 className={styles.bookingTitle}>{generalData.bookingTitle}</h2>
        <p className={styles.bookingDescription}>{generalData.bookingDescription}</p>
        <button onClick={onBooking} type="button" className={styles.bookingButton}>
          PRENOTA ORA
        </button>
      </div>
    </section>
  );
}