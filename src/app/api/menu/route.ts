import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma'; // adatta il path relativo in base a dove si trova la cartella lib

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}