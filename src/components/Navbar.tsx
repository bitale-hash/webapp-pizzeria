'use client';
 
 
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { UserRole } from '../types';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, login } = useAuth();
  const router = useRouter();

  // Funzione per switchare ruolo e pagina contemporaneamente
  const handleRoleSwitch = (role: UserRole, path: string) => {
    login(role);          // Aggiorna lo stato globale dell'utente nel contesto
    router.push(path);    // Sposta l'utente nella pagina specifica
  };

  const handleLogoClick = () => {
    if (!user) {
      router.push('/');
    } else if (user.role === 'cliente') {
      router.push('/client');
    } else if (user.role === 'gestore') {
      router.push('/gestore');
    } else if (user.role === 'corriere') {
      router.push('/corriere');
    } else if (user.role === 'cameriere') {
      router.push('/cameriere');
    } else {
      router.push('/'); // Fallback generale per altri ruoli
    }
  };

  return (
    <header className={styles.navbarHeader}>
      
      {/* 1° RIGA: Barra di controllo ruoli (Dev Bar) */}
      <nav className={styles.devBar}>
        <div>
          <span className={styles.devTitle}>
            🛠️ Dev Bar (Ruoli)
          </span>
        </div>

        <div className={styles.devControlsContainer}>
          <span className={styles.devRoleStatus}>
            Ruolo attuale: <strong>{user?.role || 'nessuno'}</strong>
          </span>

          <button className={styles.devRoleBtn} onClick={() => handleRoleSwitch('cliente', '/client')}>
            CLIENTE
          </button>
          <button className={styles.devRoleBtn} onClick={() => handleRoleSwitch('pizzaiolo', '/pizzaiolo')}>
            PIZZAIOLO
          </button>
          <button className={styles.devRoleBtn} onClick={() => handleRoleSwitch('corriere', '/corriere')}>
            CORRIERE
          </button>
          <button className={styles.devRoleBtn} onClick={() => handleRoleSwitch('cameriere', '/cameriere')}>
            CAMERIERE
          </button>
          <button className={styles.devRoleBtn} onClick={() => handleRoleSwitch('gestore', '/gestore')}>
            GESTORE
          </button>
          <button className={styles.devRoleBtn} onClick={() => handleRoleSwitch('admin', '/admin')}>
            ADMIN
          </button>
        </div>
      </nav>

      {/* 2° RIGA: Navbar Dinamica in base al ruolo */}
      <div className={styles.mainNav}>
        {/* Lato Sinistro: Logo e Link dinamici */}
        <div className={styles.navLeftGroup}>
          {(user?.role !== 'admin' && user?.role !== 'pizzaiolo' && user?.role !== 'corriere' && user?.role !== 'cameriere') && (
            <span 
              className={styles.logoText} 
              onClick={handleLogoClick}
            >
              🍕 Pizzeria WebApp
            </span>
          )}

          {/* LINK PER CLIENTE O OSPITE */}
          {(!user || user.role === 'cliente') && (
            <>
              <button 
                className={styles.navLinkBtn}
                onClick={() => router.push(user ? '/client' : '/')}
              >
                Menu
              </button>
              <button 
                className={styles.navLinkBtn}
                onClick={() => router.push('/chi-siamo')}
              >
                Chi siamo
              </button>
              {user?.role === 'cliente' && (
                <button 
                  className={styles.navLinkBtn}
                  onClick={() => router.push('/client/my-orders')}
                >
                  I Miei Ordini
                </button>
              )}
            </>
          )}

          {/* LINK PER IL GESTORE */}
          {user?.role === 'gestore' && (
            <>
              <button 
                className={styles.navLinkBtn}
                onClick={() => router.push('/gestore')}
              >
                Cassa e Sala
              </button>
              <button 
                className={styles.navLinkBtn}
                onClick={() => router.push('/gestore/panoramica')}
              >
                Panoramica Operativa & Stock
              </button>
            </>
          )}

          {/* LINK PER IL PIZZAIOLO */}
          {user?.role === 'pizzaiolo' && (
            <>
              <button 
                className={styles.navLinkBtn}
                onClick={() => router.push('/pizzaiolo')}
              >
                KDS Cucina
              </button>
            </>
          )}

          {/* LINK PER IL CORRIERE */}
          {user?.role === 'corriere' && (
            <>
              <button 
                className={styles.navLinkBtn}
                onClick={() => router.push('/corriere')}
              >
                Dashboard Consegne (Rider)
              </button>
            </>
          )}

          {/* LINK PER IL CAMERIERE */}
          {user?.role === 'cameriere' && (
            <>
              <button 
                className={styles.navLinkBtn}
                onClick={() => router.push('/cameriere')}
              >
                Dashboard Sala (Tavoli)
              </button>
            </>
          )}

          {/* LINK PER L'ADMIN */}
          {user?.role === 'admin' && (
            <>
              <button 
                className={styles.navLinkBtn}
                onClick={() => router.push('/admin')}
              >
                Gestione &quot;Menu &amp; Categorie&quot;
              </button>
              <button 
                className={styles.navLinkBtn}
                onClick={() => router.push('/admin/chi-siamo')}
              >
                Gestione &quot;Chi siamo&quot;
              </button>
              <button 
                className={styles.navLinkBtn}
                onClick={() => router.push('/admin/settings')}
              >
                Gestione &quot;Configurazioni&quot;
              </button>
            </>
          )}
        </div>
      </div>      
    </header>
  );
}