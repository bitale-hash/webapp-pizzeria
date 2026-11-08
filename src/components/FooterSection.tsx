'use client';

import React from 'react';
import { useGeneral } from '../context/GeneralContext';
import styles from './FooterSection.module.css';

export default function FooterSection() {
  const { generalData } = useGeneral();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div>
          {generalData.footerLogo && (
            <img src={generalData.footerLogo} alt="Logo" className={styles.logo} />
          )}
          <h3 className={styles.restaurantName}>
            {generalData.restaurantName || 'Pizzeria'}
          </h3>
        </div>

        <div className={styles.infoGroup}>
          {generalData.address && (
            <span className={styles.infoItem}>📍 {generalData.address}</span>
          )}
          {generalData.phone && (
            <span className={styles.infoItem}>📞 {generalData.phone}</span>
          )}
          {generalData.email && (
            <span className={styles.infoItem}>✉️ {generalData.email}</span>
          )}
        </div>

        <div className={styles.socials}>
          {generalData.facebook && (
            <a href={generalData.facebook} target="_blank" rel="noreferrer" className={styles.socialLink}>
              Facebook
            </a>
          )}
          {generalData.instagram && (
            <a href={generalData.instagram} target="_blank" rel="noreferrer" className={styles.socialLink}>
              Instagram
            </a>
          )}
          {generalData.whatsapp && (
            <a href={`https://wa.me/${generalData.whatsapp}`} target="_blank" rel="noreferrer" className={styles.socialLink}>
              WhatsApp
            </a>
          )}
        </div>
      </div>

      <div className={styles.copyright}>
        © {new Date().getFullYear()} {generalData.restaurantName || 'Pizzeria'}. Tutti i diritti riservati.
      </div>
    </footer>
  );
}