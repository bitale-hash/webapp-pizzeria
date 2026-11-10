// app/client/my-orders/page.tsx

import { prisma } from '../../../lib/prisma';
import styles from '../../../components/client/ClientHome.module.css';
import OrderCard from '../../../components/client/my-orders/OrderCard';

export const dynamic = 'force-dynamic';

export default async function MyOrdersPage() {
  const rawOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  // Mappatura e pulizia dei dati
  const orders = rawOrders.map((order) => {
    return {
      ...order,
      totalPrice: Number(order.totalPrice),
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((i: any) => {
        const productName = i.product?.name || 'Prodotto';
        const cleanedExtras = i.selectedExtras
          ? i.selectedExtras.replace(/⚠️/g, '').replace(/,\s*,/g, ',').trim()
          : '';
        const extras = cleanedExtras ? ` (Extra: ${cleanedExtras})` : '';
        const notes = i.notes ? ` [Note: ${i.notes}]` : '';

        return {
          id: i.id,
          name: productName,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          extras: cleanedExtras,
          notes: i.notes,
          formatted: `${i.quantity}x ${productName}${extras}${notes}`,
        };
      }),
    };
  });

  return (
    <div className={styles.container}>
      <div className={styles.headerFlex}>
        <div>
          <h1 className={styles.title}>
            📦 I Miei Ordini
          </h1>
          <p className={styles.subtitle}>Visualizza lo storico e lo stato dei tuoi ordini in tempo reale.</p>
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