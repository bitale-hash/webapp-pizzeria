import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma'; // Oppure usa il percorso relativo corretto es. '../../../lib/prisma'
import { writeFile } from 'fs/promises';
import path from 'path';

// GET: Recupera tutti i prodotti
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: {position: 'asc' },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Crea un nuovo prodotto (con supporto a FormData e immagini)
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const categorySlug = formData.get('categorySlug') as string;
    const imageFile = formData.get('image') as File | null;
    const ingredientIds = formData.getAll('ingredientIds').map(id => parseInt(id as string));

    if (!name || !price || !categorySlug) {
      return NextResponse.json(
        { success: false, error: 'Nome, prezzo e categoria sono obbligatori' }, 
        { status: 400 }
      );
    }

    let imageUrl = null;

    // Se è stata caricata un'immagine, la salviamo nella cartella public/uploads
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = uniqueSuffix + '-' + imageFile.name.replace(/\s/g, '_');
      const uploadPath = path.join(process.cwd(), 'public/uploads', filename);

      await writeFile(uploadPath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Categoria non trovata' }, 
        { status: 404 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        image_url: imageUrl,
        categoryId: category.id,
        ingredients: {
          create: ingredientIds && ingredientIds.length > 0
            ? ingredientIds.map((ingId: number) => ({
                ingredient: { connect: { id: ingId } }
              }))
            : [],
        },
      },
      include: {
        category: true,
        ingredients: {
          include: { ingredient: true }
        }
      },
    });

    return NextResponse.json({ success: true, data: newProduct });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
