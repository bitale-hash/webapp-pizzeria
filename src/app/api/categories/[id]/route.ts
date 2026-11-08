import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
 
const createSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-');
};

// PUT: Aggiorna una categoria esistente
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const { name, hasIngredients, departmentId } = await request.json();

    const dataToUpdate: any = { 
      hasIngredients,
      departmentId: departmentId ? parseInt(departmentId) : null 
    };

    if (name) {
      dataToUpdate.name = name;
      dataToUpdate.slug = createSlug(name);
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, data: updatedCategory });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Elimina una categoria (QUESTA MANCAVA)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    await prisma.category.delete({
      where: { id },
    });
     
    return NextResponse.json({ success: true, message: 'Categoria eliminata con successo' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}