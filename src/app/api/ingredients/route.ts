//api/ingredients/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET: Ottieni tutti gli ingredienti dal database
// Esempio per app/api/ingredients/route.ts (GET)
export async function GET() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { id: 'asc' }
    });

    // Mappatura pulita e trasparente dal database al frontend
    const formattedIngredients = ingredients.map((ing: any) => ({
      id: ing.id,
      name: ing.name,
      price: ing.price,
      pricePerKg: ing.pricePerKg ?? ing.price_per_kg,
      inStock: ing.inStock ?? ing.in_stock ?? true, // 👈 Mappa correttamente la colonna del DB
      isSpecial: ing.isSpecial ?? ing.is_special ?? false
    }));

    return NextResponse.json({ success: true, data: formattedIngredients });
  } catch (error: any) {
    console.error("Errore GET ingredienti:", error);
    return NextResponse.json({ success: false, data: [], error: error.message }, { status: 500 });
  }
}

// POST: Crea un nuovo ingrediente nel database
export async function POST(request: Request) {
  try {
    const { name, price, pricePerKg, price_per_kg, isSpecial } = await request.json();
    
    if (!name || price === undefined) {
      return NextResponse.json({ success: false, error: 'Nome e prezzo sono obbligatori' }, { status: 400 });
    }

    // Gestiamo sia la notazione camelCase che snake_case per sicurezza
    const finalPricePerKg = pricePerKg !== undefined ? pricePerKg : (price_per_kg !== undefined ? price_per_kg : 0);

    const newIngredient = await prisma.ingredient.create({
      data: {
        name,
        price: parseFloat(price) || 0,
        pricePerKg: parseFloat(finalPricePerKg) || 0, // <-- Salviamo correttamente il prezzo al kg
        inStock: true,
        isSpecial: !!isSpecial,
      },
    });

    return NextResponse.json({ success: true, data: newIngredient });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}