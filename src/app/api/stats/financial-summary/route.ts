import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '1month';

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

    // 1. Recuperiamo gli ordini pronti nel periodo per calcolare l'incasso totale
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'ready',
      },
      select: {
        totalPrice: true,
      },
    });

    const totalRevenue = orders.reduce((acc, order) => acc + Number(order.totalPrice || 0), 0);
    const totalOrders = orders.length;

    // 2. Eseguiamo la query raw con la logica esatta (Base + Extra + quantity corrette)
    const consumptionResults: any[] = await prisma.$queryRaw`
      WITH all_consumptions AS (
        -- A. Ingredienti BASE
        SELECT 
          pi.ingredient_id,
          (ci.quantity * oi.quantity) AS consumed_grams,
          i.price_per_kg
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        JOIN product_Ingredients pi ON oi.product_id = pi.product_id
        JOIN category_ingredients ci ON p.category_id = ci.category_id AND pi.ingredient_id = ci.ingredient_id
        JOIN ingredients i ON pi.ingredient_id = i.id
        WHERE o.status = 'ready' AND o.created_at >= ${startDate}

        UNION ALL

        -- B. Ingredienti EXTRA
        SELECT 
          i.id AS ingredient_id,
          (ci.quantity * oi.quantity) AS consumed_grams,
          i.price_per_kg
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        CROSS JOIN LATERAL unnest(string_to_array(oi.selected_extras, ',')) AS extra_name
        JOIN ingredients i ON TRIM(LOWER(i.name)) = TRIM(LOWER(extra_name))
        JOIN category_ingredients ci ON p.category_id = ci.category_id AND i.id = ci.ingredient_id
        WHERE o.status = 'ready' 
          AND o.created_at >= ${startDate}
          AND oi.selected_extras IS NOT NULL 
          AND TRIM(oi.selected_extras) != ''
      )
      SELECT 
        ingredient_id,
        SUM(consumed_grams) AS totale_grammi_consumati,
        price_per_kg
      FROM all_consumptions
      GROUP BY ingredient_id, price_per_kg
    `;

    // 3. Calcolo del costo totale stimato
    let totalEstimatedCost = 0;
    consumptionResults.forEach((row) => {
      const grams = Number(row.totale_grammi_consumati || 0);
      const pricePerKg = Number(row.price_per_kg || 0);
      const cost = (grams / 1000.0) * pricePerKg;
      totalEstimatedCost += cost;
    });

    totalEstimatedCost = Number(totalEstimatedCost.toFixed(2));
    const netProfit = Number((totalRevenue - totalEstimatedCost).toFixed(2));

    return NextResponse.json({
      success: true,
      summary: {
        totalRevenue,
        totalEstimatedCost,
        netProfit,
        totalOrders,
      },
    });
  } catch (error: any) {
    console.error("Errore API financial summary:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}