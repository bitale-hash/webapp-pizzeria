import { prisma } from './prisma';

export async function cleanupCompletedOrders() {
  try {
    // 1. Recupera il valore delle ore di conservazione dalle impostazioni
    const setting = await prisma.setting.findUnique({
      where: { key: 'completed_orders_retention_hours' },
    });

    // Se non impostato, usiamo un default di 24 ore
    const retentionHours = setting ? Number(setting.value) : 24;

    // 2. Calcola la data limite basata su created_at
    const cutoffDate = new Date(Date.now() - retentionHours * 60 * 60 * 1000);

    // 3. Elimina gli ordini completati ('ready') più vecchi della data limite usando createdAt
    const deletedOrders = await prisma.order.deleteMany({
      where: {
        status: 'ready', 
        createdAt: {
          lte: cutoffDate, // lte = minore o uguale (più vecchi della data limite)
        },
      },
    });

    console.log(`[Pulizia Automatica]: Eliminati ${deletedOrders.count} ordini completati.`);
    return { success: true, deletedCount: deletedOrders.count };
  } catch (error) {
    console.error('Errore durante la pulizia automatica degli ordini:', error);
    return { success: false, error };
  }
}