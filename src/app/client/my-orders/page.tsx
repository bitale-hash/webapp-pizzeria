//client/my-orders/page.tsx

import { prisma } from '../../../lib/prisma';
import styles from '../../../components/client/ClientHome.module.css';
import OrderCard from '../../../components/client/my-orders/OrderCard';

export const dynamic = 'force-dynamic';

export default async function MyOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return (
    <div className={styles.container}>
      <div className={styles.headerFlex}>
        <div>
          <h1 className={styles.title}>
            <br />
            📦 I Miei Ordini
          </h1>
          <p className={styles.subtitle}>Visualizza lo storico e lo stato dei tuoi ordini.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className={styles.categoryCard} style={{ padding: '2rem', textAlign: 'center' }}>
          <p className={styles.cartEmptyText}>Non ci sono ordini registrati nel sistema.</p>
        </div>
      ) : (
        <div className={styles.categoriesContainer}>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}