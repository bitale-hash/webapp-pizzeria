import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

// PUT: Modifica un reparto esistente
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const departmentId = parseInt(resolvedParams.id);
    const body = await request.json();
    const { name, maxCapacity, cycleTimeMinutes, fixedTimeMinutes } = body;

    const updatedDepartment = await prisma.productionDepartment.update({
      where: { id: departmentId },
      data: {
        name,
        maxCapacity: maxCapacity !== undefined ? (maxCapacity ? parseInt(maxCapacity) : null) : undefined,
        cycleTimeMinutes: cycleTimeMinutes !== undefined ? (cycleTimeMinutes ? parseInt(cycleTimeMinutes) : null) : undefined,
        fixedTimeMinutes: fixedTimeMinutes !== undefined ? (fixedTimeMinutes ? parseInt(fixedTimeMinutes) : null) : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updatedDepartment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Elimina un reparto
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const departmentId = parseInt(resolvedParams.id);

    await prisma.productionDepartment.delete({
      where: { id: departmentId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}