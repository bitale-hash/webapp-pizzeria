import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// DELETE: Elimina un prodotto dal database
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    // Prima rimuoviamo le relazioni nella tabella ponte per sicurezza (opzionale se c'è cascade, ma sicuro)
    await prisma.productIngredient.deleteMany({
      where: { productId: id },
    });

    // Poi eliminiamo il prodotto
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Prodotto eliminato con successo' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}