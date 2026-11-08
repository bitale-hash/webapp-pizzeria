//admin/chi-siamo/SocialAndFooterCard.tsx

import React from 'react';
import styles from './AdminChiSiamo.module.css';

interface Props {
  facebook: string; setFacebook: (v: string) => void;
  instagram: string; setInstagram: (v: string) => void;
  whatsapp: string; setWhatsapp: (v: string) => void;
  footerLogo: string;
  onFooterLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SocialAndFooterCard({
  facebook, setFacebook, instagram, setInstagram, whatsapp, setWhatsapp, footerLogo, onFooterLogoUpload
}: Props) {
  return (
    <>
      <div className={styles.cardBox}>
        <h2 className={styles.cardTitle}>4. Social e Contatti</h2>
        <div className={styles.fieldsGroup}>
          <label>Link Facebook</label><input type="text" value={facebook} onChange={e => setFacebook(e.target.value)} className={styles.inputField} />
          <label>Link Instagram</label><input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} className={styles.inputField} />
          <label>WhatsApp</label><input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className={styles.inputField} />
        </div>
      </div>

      <div className={styles.cardBox}>
        <h2 className={styles.cardTitle}>5. Sezione Logo / Immagine Footer</h2>
        <div className={styles.fieldsGroup}>
          <label>Carica Logo o Immagine Footer (.png, .jpg)</label>
          <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={onFooterLogoUpload} className={styles.fileInput} />
          {footerLogo && (
            <div className={styles.imagePreviewWrapper}>
              <img src={footerLogo} alt="Anteprima Logo Footer" className={styles.imagePreview} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}