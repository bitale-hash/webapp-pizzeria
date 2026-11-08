//api/settings/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';

// GET: Recupera tutte le impostazioni
export async function GET() {
  try {
    const settingsList = await prisma.setting.findMany();

    const settingsMap: Record<string, string> = {};
    for (const item of settingsList) {
      settingsMap[item.key] = item.value;
    }

    return NextResponse.json({ success: true, settings: settingsMap });
  } catch (error) {
    console.error('Errore lettura impostazioni:', error);
    return NextResponse.json({ success: false, error: 'Errore lettura' }, { status: 500 });
  }
}

// POST: Salva o aggiorna le impostazioni
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const updates = Object.entries(body).map(([key, value]) => {
      return prisma.setting.upsert({
        where: { key },
        update: { value: String(value), updatedAt: new Date() },
        create: { key, value: String(value) },
      });
    });

    await Promise.all(updates);

    // 🚀 CORRETTO: Invalida la pagina frontend/admin che mostra le impostazioni (es. '/admin/settings' o la rotta corretta della tua pagina)
    // Non passare mai un URL che inizia con /api/
    revalidatePath('/admin/settings'); 

    return NextResponse.json({ success: true, message: 'Impostazioni aggiornate con successo' });
  } catch (error) {
    console.error('Errore salvataggio impostazioni:', error);
    return NextResponse.json({ success: false, error: 'Errore salvataggio' }, { status: 500 });
  }
}