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

    const consumptions: any[] = await prisma.$queryRaw`
      WITH all_consumptions AS (
        -- 1. Ingredienti BASE
        SELECT 
          pi.ingredient_id,
          i.name AS ingredient_name,
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

        -- 2. Ingredienti EXTRA
        SELECT 
          i.id AS ingredient_id,
          i.name AS ingredient_name,
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
        ingredient_name,
        SUM(consumed_grams) AS totale_grammi_consumati,
        price_per_kg
      FROM all_consumptions
      GROUP BY ingredient_id, ingredient_name, price_per_kg
      ORDER BY ingredient_name ASC
    `;

    return NextResponse.json({
      success: true,
      consumptions,
    });
  } catch (error: any) {
    console.error("Errore API ingredient-consumption:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}