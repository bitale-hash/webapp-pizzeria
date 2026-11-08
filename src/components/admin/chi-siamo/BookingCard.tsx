//admin/chi-siamo/BookingCard.tsx
import React from 'react';
import styles from './AdminChiSiamo.module.css';

interface Props {
  bookingTitle: string;
  setBookingTitle: (v: string) => void;
  bookingDescription: string;
  setBookingDescription: (v: string) => void;
  bookingBgImage: string;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BookingCard({
  bookingTitle, setBookingTitle, bookingDescription, setBookingDescription, bookingBgImage, onImageUpload
}: Props) {
  return (
    <div className={styles.cardBox}>
      <h2 className={styles.cardTitle}>2. Sezione Prenotazione</h2>
      <div className={styles.fieldsGroup}>
        <label>Titolo Prenotazione</label>
        <input type="text" value={bookingTitle} onChange={e => setBookingTitle(e.target.value)} className={styles.inputField} />

        <label>Descrizione</label>
        <textarea rows={2} value={bookingDescription} onChange={e => setBookingDescription(e.target.value)} className={styles.textareaField} />

        <label>Carica Sfondo Banner (Background .png, .jpg)</label>
        <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={onImageUpload} className={styles.fileInput} />
        {bookingBgImage && (
          <div className={styles.imagePreviewWrapper}>
            <img src={bookingBgImage} alt="Anteprima Sfondo" className={styles.imagePreview} />
          </div>
        )}
      </div>
    </div>
  );
}