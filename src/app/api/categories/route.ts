import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// Funzione di supporto per generare lo slug
const createSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-');
};

// GET: Ottieni tutte le categorie
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { position: 'asc' },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Crea una nuova categoria
export async function POST(request: Request) {
  try {
    const { name, hasIngredients, departmentId } = await request.json();
    
    if (!name) {
      return NextResponse.json({ success: false, error: 'Il nome è obbligatorio' }, { status: 400 });
    }

    const slug = createSlug(name);

    const newCategory = await prisma.category.create({
      data: { 
        name, 
        slug, 
        hasIngredients: hasIngredients ?? false,
        departmentId: departmentId ? parseInt(departmentId) : null,
      },
    });

    return NextResponse.json({ success: true, data: newCategory });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}