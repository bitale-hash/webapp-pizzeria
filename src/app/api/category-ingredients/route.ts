import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET: Restituisce le categorie con hasIngredients = true, tutti gli ingredienti e le grammature salvate
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { hasIngredients: true },
      orderBy: { position: 'asc' },
    });

    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    });

    const categoryIngredients = await prisma.categoryIngredient.findMany();

    return NextResponse.json({
      success: true,
      categories,
      ingredients,
      categoryIngredients,
    });
  } catch (error: any) {
    console.error("Errore recupero grammature:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Salva in blocco o aggiorna le quantità per le categorie
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { items } = body; // Ci aspettemmo un array di elementi: [{ categoryId, ingredientId, quantity }]

    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, error: "Formato dati non valido" }, { status: 400 });
    }

    // Eseguiamo gli upsert per ogni elemento inviato
    for (const item of items) {
      const { categoryId, ingredientId, quantity } = item;
      
      if (categoryId && ingredientId !== undefined) {
        
        await prisma.categoryIngredient.upsert({
          where: {
            categoryId_ingredientId: {
              categoryId: Number(categoryId),
              ingredientId: Number(ingredientId),
            },
          },
          update: {
            quantity: Number(quantity) || 0,
          },
          create: {
            categoryId: Number(categoryId),
            ingredientId: Number(ingredientId),
            quantity: Number(quantity) || 0,
          },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Grammature aggiornate con successo" });
  } catch (error: any) {
    console.error("Errore durante il salvataggio PUT:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}