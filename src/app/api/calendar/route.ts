//api/calendar/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';

// GET: Recupera le eccezioni per i prossimi 60-90 giorni
export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const exceptions = await prisma.calendar_exception.findMany({
      where: { date: { gte: today } },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({ success: true, exceptions });
  } catch (error) {
    console.error('Errore lettura calendario:', error);
    return NextResponse.json({ success: false, error: 'Errore lettura' }, { status: 500 });
  }
}

// POST: Imposta un'eccezione con relativi turni e orari
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      date, 
      isClosed, 
      hasLunch, 
      lunchOpen, 
      lunchClose, 
      hasDinner, 
      dinnerOpen, 
      dinnerClose, 
      reason 
    } = body;

    if (!date) {
      return NextResponse.json({ success: false, error: 'La data è obbligatoria' }, { status: 400 });
    }

    const exception = await prisma.calendar_exception.upsert({
      where: { date },
      update: {
        isClosed,
        hasLunch: isClosed ? false : hasLunch,
        lunchOpen: (isClosed || !hasLunch) ? null : lunchOpen,
        lunchClose: (isClosed || !hasLunch) ? null : lunchClose,
        hasDinner: isClosed ? false : hasDinner,
        dinnerOpen: (isClosed || !hasDinner) ? null : dinnerOpen,
        dinnerClose: (isClosed || !hasDinner) ? null : dinnerClose,
        reason,
      },
      create: {
        date,
        isClosed,
        hasLunch: isClosed ? false : hasLunch,
        lunchOpen: (isClosed || !hasLunch) ? null : lunchOpen,
        lunchClose: (isClosed || !hasLunch) ? null : lunchClose,
        hasDinner: isClosed ? false : hasDinner,
        dinnerOpen: (isClosed || !hasDinner) ? null : dinnerOpen,
        dinnerClose: (isClosed || !hasDinner) ? null : dinnerClose,
        reason,
      },
    });

    revalidatePath('/admin/calendar');

    return NextResponse.json({ success: true, exception, message: 'Calendario aggiornato con successo' });
  } catch (error) {
    console.error('Errore salvataggio eccezione:', error);
    return NextResponse.json({ success: false, error: 'Errore salvataggio' }, { status: 500 });
  }
}