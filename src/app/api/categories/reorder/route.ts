//api/categories/reorder/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function PUT(request: Request) {
  try {
    const { items } = await request.json();

    for (const item of items) {
      await prisma.category.update({
        where: { id: item.id },
        data: { position: item.position } as any,
      });
    }

    return NextResponse.json({ success: true, message: 'Ordinamento categorie aggiornato' });
  } catch (error) {
    console.error('Errore:', error);
    return NextResponse.json({ success: false, error: 'Errore interno' }, { status: 500 });
  }
}