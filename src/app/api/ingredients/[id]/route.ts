//api/ingredients/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const body = await request.json();
    const { inStock, pricePerKg } = body; // 👈 Solo standard pulito

    const updateData: any = {};

    if (inStock !== undefined) {
      updateData.inStock = Boolean(inStock);
    }

    if (pricePerKg !== undefined) {
      updateData.pricePerKg = parseFloat(pricePerKg);
    }

    const updatedIngredient = await prisma.ingredient.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, ingredient: updatedIngredient });
  } catch (error: any) {
    console.error("Errore dettagliato PUT ingredienti:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    // 1. Troviamo tutte le associazioni nella tabella di giunzione per capire quali prodotti sono coinvolti
    const productIngredients = await prisma.productIngredient.findMany({
      where: { ingredientId: id },
      select: { productId: true },
    });

    const productIdsToDelete = productIngredients.map((pi) => pi.productId);

    // 2. Eseguiamo una transazione per pulire prima i prodotti dipendenti e poi l'ingrediente
    await prisma.$transaction([
      // Elimina le relazioni nella tabella di giunzione (se non c'è già il cascade attivo)
      prisma.productIngredient.deleteMany({
        where: { ingredientId: id },
      }),
      // Elimina i prodotti che dipendevano da questo ingrediente (regola Admin)
      prisma.product.deleteMany({
        where: { id: { in: productIdsToDelete } },
      }),
      // Infine, elimina l'ingrediente master
      prisma.ingredient.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'Ingrediente e prodotti correlati eliminati con successo' 
    });
  } catch (error: any) {
    console.error("Errore durante l'eliminazione dell'ingrediente:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}