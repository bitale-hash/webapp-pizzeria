 'use client';

 
import { useGeneral } from '../../context/GeneralContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

import PresentationSection from '../../components/chi-siamo/PresentationSection';
import BookingSection from '../../components/chi-siamo/BookingSection';
import InfoAndHoursSection from '../../components/chi-siamo/InfoAndHoursSection';

 
import styles from '../../components/chi-siamo/chi-siamo.module.css';

export default function ClientChiSiamoPage() {
  const { generalData } = useGeneral();
  const router = useRouter();
  const { user } = useAuth();

  const handleBooking = () => {
    if (user) {
      router.push('/client');
    } else {
      router.push('/');
    }
  };

  return (
    <div className={styles.container}>

      <PresentationSection generalData={generalData} />

      <BookingSection generalData={generalData} onBooking={handleBooking} />
      
      <InfoAndHoursSection generalData={generalData} />
   
    </div>
  );
}