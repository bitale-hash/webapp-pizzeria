import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '1month'; // 1month, 3months, 6months, year

    // Data di riferimento attuale (ottobre 2026)
    const now = new Date('2026-10-19T17:13:00Z');
    let startDate = new Date(now);

    if (period === '1month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === '3months') {
      startDate.setMonth(now.getMonth() - 3);
    } else if (period === '6months') {
      startDate.setMonth(now.getMonth() - 6);
    } else if (period === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    // Recuperiamo gli elementi d'ordine filtrando per data e stato 'ready'
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: startDate,
          },
          status: 'ready', // Filtriamo gli ordini con stato ready che hai caricato
        },
      },
      include: {
        order: true,
      },
    });

    // Raggruppiamo e sommiamo le quantità per productId (camelCase di Prisma)
    const productStats: { [key: number]: { productId: number; totalSold: number; totalRevenue: number } } = {};

    orderItems.forEach((item: any) => {
      const pId = item.productId; // Corretto in camelCase per Prisma
      const qty = item.quantity || 0;
      const price = Number(item.unitPrice || 0); // Corretto in camelCase per Prisma

      if (pId) {
        if (!productStats[pId]) {
          productStats[pId] = { productId: pId, totalSold: 0, totalRevenue: 0 };
        }
        productStats[pId].totalSold += qty;
        productStats[pId].totalRevenue += qty * price;
      }
    });

    // Convertiamo in array e ordiniamo per quantità venduta (discendente)
    const sortedProducts = Object.values(productStats).sort((a, b) => b.totalSold - a.totalSold);

    // Recuperiamo i nomi dei prodotti dal database
    const productIds = sortedProducts.map(p => p.productId);
    const productsInfo = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productsMap = new Map(productsInfo.map((p: any) => [p.id, p.name]));

    const result = sortedProducts.slice(0, 5).map(item => ({
      id: item.productId,
      name: productsMap.get(item.productId) || `Prodotto #${item.productId}`,
      totalSold: item.totalSold,
      totalRevenue: item.totalRevenue,
    }));

    return NextResponse.json({ success: true, products: result });
  } catch (error: any) {
    console.error("Errore API top products:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}