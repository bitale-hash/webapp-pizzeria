//api/orders/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma'; // 👈 Usiamo l'istanza singleton condivisa

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // 👈 Tipizzazione corretta Next.js 15+
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error(`❌ ERRORE PATCH /api/orders:`, error.message || error);
    return NextResponse.json({ success: false, error: 'Impossibile aggiornare l\'ordine' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // 👈 Await aggiunto anche qui

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Ordine eliminato con successo' });
  } catch (error: any) {
    console.error(`❌ ERRORE DELETE /api/orders:`, error.message || error);
    return NextResponse.json({ success: false, error: 'Impossibile eliminare l\'ordine' }, { status: 500 });
  }
}