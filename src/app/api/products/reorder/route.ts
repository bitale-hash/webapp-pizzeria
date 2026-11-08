import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function PUT(request: Request) {
  try {
    const { items } = await request.json(); 
    // items sarà un array del tipo: [{ id: 3, position: 0 }, { id: 15, position: 1 }, ...]

    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: { position: item.position } as any,
         
      });
    }

    return NextResponse.json({ success: true, message: 'Ordinamento prodotti aggiornato con successo' });
  } catch (error) {
    console.error('Errore durante il salvataggio dell ordinamento:', error);
    return NextResponse.json({ success: false, error: 'Errore interno del server' }, { status: 500 });
  }
}