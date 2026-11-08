import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    // Proviamo a leggere la tabella degli ingredienti (o delle categorie)
    const ingredients = await prisma.ingredient.findMany();
    
    return NextResponse.json({
      success: true,
      message: 'Connessione a Neon riuscita con successo!',
      data: ingredients,
    });
  } catch (error: any) {
    console.error('Errore di connessione al database:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Errore durante la connessione al database',
        error: error.message,
      },
      { status: 500 }
    );
  }
}