import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Recupera tutti i reparti di produzione con le relative categorie associate
export async function GET() {
  try {
    const departments = await prisma.productionDepartment.findMany({
      include: {
        categories: true,
      },
      orderBy: { id: 'asc' },
    });
    return NextResponse.json({ success: true, data: departments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Crea un nuovo reparto di produzione (Max 2 reparti di produzione consentiti)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, maxCapacity, cycleTimeMinutes, fixedTimeMinutes } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: ' Il nome del reparto è obbligatorio' }, 
        { status: 400 }
      );
    }

    // 🛡️ CONTROLLO: Se non è un reparto a tempo fisso (es. Bevande), verifichiamo quanti reparti di produzione esistono già
    if (!fixedTimeMinutes) {
      const existingProductionDeptsCount = await prisma.productionDepartment.count({
        where: {
          fixedTimeMinutes: null,
        },
      });

      if (existingProductionDeptsCount >= 2) {
        return NextResponse.json(
          { success: false, error: '⚠️ Limite raggiunto: puoi configurare un massimo di 2 reparti di produzione.' }, 
          { status: 400 }
        );
      }
    }

    const newDepartment = await prisma.productionDepartment.create({
      data: {
        name,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
        cycleTimeMinutes: cycleTimeMinutes ? parseInt(cycleTimeMinutes) : null,
        fixedTimeMinutes: fixedTimeMinutes ? parseInt(fixedTimeMinutes) : null,
      },
    });

    return NextResponse.json({ success: true, data: newDepartment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}