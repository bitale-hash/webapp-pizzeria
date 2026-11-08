//admin/chi-siamo/PresentationCard.tsx

import React from 'react';
import styles from './AdminChiSiamo.module.css';

interface Props {
  title: string;
  setTitle: (v: string) => void;
  subtitle: string;
  setSubtitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  presentationImage: string;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PresentationCard({
  title, setTitle, subtitle, setSubtitle, description, setDescription, presentationImage, onImageUpload
}: Props) {
  return (
    <div className={styles.cardBox}>
      <h2 className={styles.cardTitle}>1. Sezione Presentazione</h2>
      <div className={styles.fieldsGroup}>
        <label>Titolo Principale</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={styles.inputField} />

        <label>Sottotitolo</label>
        <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} className={styles.inputField} />

        <label>Descrizione</label>
        <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className={styles.textareaField} />

        <label>Carica Immagine di Presentazione (.png, .jpg)</label>
        <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={onImageUpload} className={styles.fileInput} />
        {presentationImage && (
          <div className={styles.imagePreviewWrapper}>
            <img src={presentationImage} alt="Anteprima" className={styles.imagePreview} />
          </div>
        )}
      </div>
    </div>
  );
}