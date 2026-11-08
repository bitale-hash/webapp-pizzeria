//admin/chi-siamo/InfoAndHoursCard.tsx
import React from 'react';
import styles from './AdminChiSiamo.module.css';

interface Props {
  restaurantName: string; setRestaurantName: (v: string) => void;
  address: string; setAddress: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  email: string; setEmail: (v: string) => void;
}

export default function InfoAndHoursCard({
  restaurantName, setRestaurantName, address, setAddress, phone, setPhone, email, setEmail
}: Props) {
  return (
    <div className={styles.cardBox}>
      <h2 className={styles.cardTitle}>3. Informazioni del Locale</h2>
      <div className={styles.gridTwoCols}>
        <div><label>Nome Attività</label><input type="text" value={restaurantName} onChange={e => setRestaurantName(e.target.value)} className={styles.inputField} /></div>
        <div><label>Indirizzo</label><input type="text" value={address} onChange={e => setAddress(e.target.value)} className={styles.inputField} /></div>
        <div><label>Telefono</label><input type="text" value={phone} onChange={e => setPhone(e.target.value)} className={styles.inputField} /></div>
        <div><label>Email</label><input type="text" value={email} onChange={e => setEmail(e.target.value)} className={styles.inputField} /></div>
      </div>
    </div>
  );
}