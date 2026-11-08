 //admin/page.tsx
 'use client';
 
import { useAuth } from '../../context/AuthContext';
import { usePizzeria } from '../../context/PizzeriaContext';
import CategoryManager from '../../components/admin/CategoryManager';
import ProductManager from '../../components/admin/ProductManager';
import IngredientManager from '../../components/admin/IngredientManager';
import MenuList from '../../components/admin/MenuList';
import styles from './page.module.css';

export default function AdminPage() {
  const { user } = useAuth();
  const pizzeriaData = usePizzeria();

  if (user?.role !== 'admin') {
    return (
      <main>
        <div className={styles.container}>
          <h1 className={styles.title}>Accesso Negato</h1>
          <p>Questa sezione è riservata esclusivamente all'Amministratore.</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className={styles.container} style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h1 className={styles.title} style={{ marginBottom: '1.5rem' }}>🛠️ Pannello Amministrazione & Magazzino</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',  gap: '1.5rem', marginBottom: '2rem' }}>
          
          <CategoryManager />

          <ProductManager />
          
          <IngredientManager />
        </div>

        <h2 className={styles.h2}>
          Menù Attuale ({pizzeriaData.menu.length} Prodotti)
        </h2>
        
        <MenuList />
      </div>
    </main>
  );
}
