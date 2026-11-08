//admin/chi-siamo/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useGeneral } from '../../../context/GeneralContext';

import PresentationCard from '../../../components/admin/chi-siamo/PresentationCard';
import BookingCard from '../../../components/admin/chi-siamo/BookingCard';
import InfoAndHoursCard from '../../../components/admin/chi-siamo/InfoAndHoursCard';
import SocialAndFooterCard from '../../../components/admin/chi-siamo/SocialAndFooterCard';
import ConfirmModal from '../../../components/ConfirmModal';

import styles from '../../../components/admin/chi-siamo/AdminChiSiamo.module.css';

export default function AdminChiSiamoPage() {
  const { user } = useAuth();
  const { generalData, updateGeneralData } = useGeneral();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [presentationImage, setPresentationImage] = useState('');
  const [presentationImageFile, setPresentationImageFile] = useState<File | null>(null);

  const [bookingTitle, setBookingTitle] = useState('');
  const [bookingDescription, setBookingDescription] = useState('');
  const [bookingBgImage, setBookingBgImage] = useState('');
  const [bookingBgImageFile, setBookingBgImageFile] = useState<File | null>(null);

  const [restaurantName, setRestaurantName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [footerLogo, setFooterLogo] = useState('');
  const [footerLogoFile, setFooterLogoFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant?: 'danger' | 'primary';
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'primary',
  });

  // Sincronizziamo lo stato non appena generalData arriva dal context
  useEffect(() => {
    if (generalData) {
      setTitle(generalData.title || '');
      setSubtitle(generalData.subtitle || '');
      setDescription(generalData.description || '');
      setPresentationImage(generalData.presentationImage || '');
      setBookingTitle(generalData.bookingTitle || '');
      setBookingDescription(generalData.bookingDescription || '');
      setBookingBgImage(generalData.bookingBgImage || '');
      setRestaurantName(generalData.restaurantName || '');
      setAddress(generalData.address || '');
      setPhone(generalData.phone || '');
      setEmail(generalData.email || '');
      setFacebook(generalData.facebook || '');
      setInstagram(generalData.instagram || '');
      setWhatsapp(generalData.whatsapp || '');
      setFooterLogo(generalData.footerLogo || '');
    }
  }, [generalData]);

  if (user?.role !== 'admin') {
    return <main className={styles.accessDenied}><h1>Accesso Negato</h1></main>;
  }

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>, 
    setImageState: (val: string) => void,
    setFileState: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setModalConfig({
          isOpen: true,
          title: 'File troppo grande',
          message: 'L\'immagine selezionata supera i 2MB. Scegline una più leggera.',
          variant: 'danger',
        });
        return;
      }

      setFileState(file); // Salviamo il file binario reale per il FormData

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageState(reader.result as string); // Salviamo l'anteprima visiva
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateGeneralData({
        title, subtitle, description, presentationImage,
        bookingTitle, bookingDescription, bookingBgImage,
        restaurantName, address, phone, email,
        facebook, instagram, whatsapp, footerLogo,
        presentationImageFile,
        bookingBgImageFile,
        footerLogoFile
      });

      // Puliamo i file temporanei dopo il salvataggio riuscito
      setPresentationImageFile(null);
      setBookingBgImageFile(null);
      setFooterLogoFile(null);

      setModalConfig({
        isOpen: true,
        title: 'Salvato con successo',
        message: 'Modifiche e immagini salvate correttamente sul database!',
        variant: 'primary',
      });
    } catch (err) {
      console.error(err);
      setModalConfig({
        isOpen: true,
        title: 'Errore di salvataggio',
        message: 'Impossibile salvare sul database. Controlla la console per i dettagli.',
        variant: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.mainContainer}>
      <h1 className={styles.heading}>⚙️ Personalizza Pagina "Chi Siamo"</h1>

      <form onSubmit={handleSave} className={styles.form}>
        
        <PresentationCard 
          title={title} setTitle={setTitle}
          subtitle={subtitle} setSubtitle={setSubtitle}
          description={description} setDescription={setDescription}
          presentationImage={presentationImage}
          onImageUpload={e => handleImageUpload(e, setPresentationImage, setPresentationImageFile)}
        />

        <BookingCard 
          bookingTitle={bookingTitle} setBookingTitle={setBookingTitle}
          bookingDescription={bookingDescription} setBookingDescription={setBookingDescription}
          bookingBgImage={bookingBgImage}
          onImageUpload={e => handleImageUpload(e, setBookingBgImage, setBookingBgImageFile)}
        />

        <InfoAndHoursCard 
          restaurantName={restaurantName} setRestaurantName={setRestaurantName}
          address={address} setAddress={setAddress}
          phone={phone} setPhone={setPhone}
          email={email} setEmail={setEmail}
        />

        <SocialAndFooterCard 
          facebook={facebook} setFacebook={setFacebook}
          instagram={instagram} setInstagram={setInstagram}
          whatsapp={whatsapp} setWhatsapp={setWhatsapp}
          footerLogo={footerLogo}
          onFooterLogoUpload={e => handleImageUpload(e, setFooterLogo, setFooterLogoFile)}
        />

        <button type="submit" disabled={saving} className={styles.saveButton}>
          {saving ? 'Salvataggio in corso...' : 'Salva Modifiche 💾'}
        </button>
      </form>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText="Capito"
        onConfirm={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        variant={modalConfig.variant}
      />
    </main>
  );
}