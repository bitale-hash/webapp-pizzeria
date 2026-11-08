'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface OpeningHour {
  day: string;
  isOpen: boolean;
  hours: string;
}

export interface GeneralData {
  title: string;
  subtitle: string;
  description: string;
  presentationImage: string;
  bookingTitle: string;
  bookingDescription: string;
  bookingBgImage: string;
  restaurantName: string;
  address: string;
  phone: string;
  email: string;
  openingHours: OpeningHour[];
  facebook: string;
  instagram: string;
  whatsapp: string;
  footerLogo: string;
}

// Estendiamo il tipo per permettere il passaggio dei File opzionali
export interface UpdateGeneralPayload extends Partial<GeneralData> {
  presentationImageFile?: File | null;
  bookingBgImageFile?: File | null;
  footerLogoFile?: File | null;
}

interface GeneralContextType {
  generalData: GeneralData;
  updateGeneralData: (newData: UpdateGeneralPayload) => Promise<void>;
  updateOpeningHour: (index: number, isOpen: boolean, hours: string) => Promise<void>;
}

const GeneralContext = createContext<GeneralContextType | undefined>(undefined);

const defaultOpeningHours: OpeningHour[] = [
  { day: 'Lunedì', isOpen: false, hours: 'Chiuso' },
  { day: 'Martedì', isOpen: true, hours: '10:00 → 14:00 / 18:00 → 23:00' },
  { day: 'Mercoledì', isOpen: true, hours: '10:00 → 14:00 / 18:00 → 23:00' },
  { day: 'Giovedì', isOpen: true, hours: '10:00 → 14:00 / 18:00 → 23:00' },
  { day: 'Venerdì', isOpen: true, hours: '10:00 → 14:00 / 18:00 → 23:00' },
  { day: 'Sabato', isOpen: true, hours: '10:00 → 23:00' },
  { day: 'Domenica', isOpen: true, hours: '19:00 → 23:00' },
];

const defaultGeneralData: GeneralData = {
  title: '',
  subtitle: '',
  description: '',
  presentationImage: '',
  bookingTitle: '',
  bookingDescription: '',
  bookingBgImage: '',
  restaurantName: '',
  address: '',
  phone: '',
  email: '',
  openingHours: defaultOpeningHours,
  facebook: '',
  instagram: '',
  whatsapp: '',
  footerLogo: '',
};

export const GeneralProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [generalData, setGeneralData] = useState<GeneralData>(defaultGeneralData);

  useEffect(() => {
    fetch('/api/general')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setGeneralData(prev => ({
            ...prev,
            ...data,
            openingHours: data.openingHours && data.openingHours.length > 0 ? data.openingHours : prev.openingHours
          }));
        }
      })
      .catch(err => console.error('Errore caricamento dati generali dal DB:', err));
  }, []);

  const updateGeneralData = async (newData: UpdateGeneralPayload) => {
    try {
      const formData = new FormData();

      // Aggiungiamo i campi testuali se presenti
      if (newData.title !== undefined) formData.append('title', newData.title);
      if (newData.subtitle !== undefined) formData.append('subtitle', newData.subtitle);
      if (newData.description !== undefined) formData.append('description', newData.description);
      if (newData.bookingTitle !== undefined) formData.append('bookingTitle', newData.bookingTitle);
      if (newData.bookingDescription !== undefined) formData.append('bookingDescription', newData.bookingDescription);
      if (newData.restaurantName !== undefined) formData.append('restaurantName', newData.restaurantName);
      if (newData.address !== undefined) formData.append('address', newData.address);
      if (newData.phone !== undefined) formData.append('phone', newData.phone);
      if (newData.email !== undefined) formData.append('email', newData.email);
      if (newData.facebook !== undefined) formData.append('facebook', newData.facebook);
      if (newData.instagram !== undefined) formData.append('instagram', newData.instagram);
      if (newData.whatsapp !== undefined) formData.append('whatsapp', newData.whatsapp);
      
      if (newData.openingHours !== undefined) {
        formData.append('openingHours', JSON.stringify(newData.openingHours));
      }

      // Aggiungiamo i file binari reali (esattamente come fai per i prodotti!)
      if (newData.presentationImageFile) {
        formData.append('presentationImage', newData.presentationImageFile);
      }
      if (newData.bookingBgImageFile) {
        formData.append('bookingBgImage', newData.bookingBgImageFile);
      }
      if (newData.footerLogoFile) {
        formData.append('footerLogo', newData.footerLogoFile);
      }

      const response = await fetch('/api/general', {
        method: 'POST',
       
        // Nota: nessun 'Content-Type' impostato manualmente, ci pensa il browser con il FormData
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Errore durante il salvataggio');
      }

      // Aggiorniamo lo stato locale con i dati restituiti dal server
      setGeneralData(prev => ({
        ...prev,
        ...newData,
        ...(result.data || {})
      }));
    } catch (error) {
      console.error('Errore nel salvataggio sul database:', error);
      throw error;
    }
  };

  const updateOpeningHour = async (index: number, isOpen: boolean, hours: string) => {
    const newHours = [...generalData.openingHours];
    newHours[index] = { ...newHours[index], isOpen, hours };
    await updateGeneralData({ openingHours: newHours });
  };

  return (
    <GeneralContext.Provider value={{ generalData, updateGeneralData, updateOpeningHour }}>
      {children}
    </GeneralContext.Provider>
  );
};

export const useGeneral = () => {
  const context = useContext(GeneralContext);
  if (!context) {
    throw new Error('useGeneral deve essere usato all\'interno di un GeneralProvider');
  }
  return context;
};