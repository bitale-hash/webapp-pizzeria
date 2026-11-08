import React from 'react';
import styles from './chi-siamo.module.css';

export default function InfoAndHoursSection({ generalData }: { generalData: any }) {
  return (
    <section className={styles.infoSection}>
      <div className={styles.infoGrid}>
        
        {/* Tabella Orari */}
        <div className={styles.cardBox}>
          <h3 className={styles.cardTitle}>Orari di Apertura</h3>
          <ul className={styles.hoursList}>
            {(generalData.openingHours || []).map((item: any) => (
              <li key={item.day} className={styles.hoursItem}>
                <span>{item.day.toUpperCase()}</span>
                {item.isOpen ? (
                  <span className={styles.hoursOpen}>{item.hours}</span>
                ) : (
                  <span className={styles.hoursClosed}>CHIUSO</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Box Contatti */}
        <div className={`${styles.cardBox} ${styles.contactsBox}`}>
          <h3 className={styles.restaurantHeading}>{generalData.restaurantName}</h3>
          <p className={styles.contactText}>📍 {generalData.address}</p>
          <p className={styles.contactText}>📞 {generalData.phone}</p>
          <p className={styles.contactText}>✉️ {generalData.email}</p>
          
          <h4 className={styles.socialHeading}>SEGUICI SUI SOCIAL</h4>
          <div className={styles.socialContainer}>
            {generalData.facebook && <a href={generalData.facebook} target="_blank" rel="noreferrer" className={styles.socialBtnFacebook}>Facebook</a>}
            {generalData.instagram && <a href={generalData.instagram} target="_blank" rel="noreferrer" className={styles.socialBtnInstagram}>Instagram</a>}
            {generalData.whatsapp && <a href={`https://wa.me/${generalData.whatsapp}`} target="_blank" rel="noreferrer" className={styles.socialBtnWhatsapp}>WhatsApp</a>}
          </div>
        </div>

      </div>

      {/* Mappa */}
      <div className={styles.mapWrapper}>
        <iframe 
          title="Mappa Posizione"
          className={styles.mapIframe}
          loading="lazy" 
          src={`https://maps.google.com/maps?q=${encodeURIComponent(generalData.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
        />
      </div>
    </section>
  );
}