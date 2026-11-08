import { NextResponse } from 'next/server';
import { cleanupCompletedOrders } from '../../../../lib/cleanupOrders'; // Adatta il percorso

export async function GET(request: Request) {
  try {
    // Opzionale ma consigliato: sicurezza con una chiave segreta per evitare che chiunque chiami l'endpoint
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const result = await cleanupCompletedOrders();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Errore interno' }, { status: 500 });
  }
}