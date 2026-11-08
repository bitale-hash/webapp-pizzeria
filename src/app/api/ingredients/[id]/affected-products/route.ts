//api/ingredients/[id]/affected-products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const ingredientId = parseInt(resolvedParams.id);

    // Cerchiamo i prodotti collegati a questo ingrediente tramite la tabella di giunzione
    const relations = await prisma.productIngredient.findMany({
      where: { ingredientId },
      include: {
        product: {
          select: { name: true },
        },
      },
    });

    // Estradiamo i nomi dei prodotti in cui è presente l'ingrediente
    const productNames = relations.map((rel) => rel.product.name);

    return NextResponse.json({ success: true, products: productNames });
  } catch (error: any) {
    console.error("Errore recupero prodotti collegati:", error);
    return NextResponse.json({ success: false, products: [], error: error.message }, { status: 500 });
  }
}