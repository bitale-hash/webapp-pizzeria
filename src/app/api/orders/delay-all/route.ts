//api/orders/delay-all/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const minutesToAdd = body.minutes || 15;

    // 1. Recuperiamo tutti gli ordini attivi (quelli non ancora 'ready')
    const activeOrders = await prisma.order.findMany({
      where: {
        status: { not: 'ready' }
      }
    });

    // 2. Iteriamo e aggiorniamo l'orario di ritiro per ciascuno
    for (const order of activeOrders) {
      let newPickupTime = order.pickupTime;
      
      if (newPickupTime && newPickupTime !== 'ASAP') {
        const [hours, mins] = newPickupTime.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(mins)) {
          const date = new Date();
          date.setHours(hours, mins + minutesToAdd);
          newPickupTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { pickupTime: newPickupTime }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Tutti gli ${activeOrders.length} ordini attivi sono stati posticipati di ${minutesToAdd} minuti.` 
    });

  } catch (error: any) {
    console.error('❌ ERRORE POST /api/orders/delay-all:', error.message || error);
    return NextResponse.json({ success: false, error: 'Impossibile posticipare gli ordini' }, { status: 500 });
  }
}