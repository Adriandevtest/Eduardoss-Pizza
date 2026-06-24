import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Pizza from '@/models/Pizza';
import { requireRole } from '@/lib/auth';

// ACTUALIZAR (PUT)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole('admin');
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();

    const { id } = await context.params;
    const body = await request.json();

    const updatedPizza = await Pizza.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );

    if (!updatedPizza) {
      return NextResponse.json(
        { error: "Pizza no encontrada" },
        { status: 404 }
      );
    }

    console.log("Pizza actualizada con éxito en Atlas 🍕");
    return NextResponse.json(updatedPizza);

  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar" },
      { status: 500 }
    );
  }
}

// ELIMINAR (DELETE)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole('admin');
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();

    const { id } = await context.params;

    const deletedPizza = await Pizza.findByIdAndDelete(id);

    if (!deletedPizza) {
      return NextResponse.json(
        { error: "No se encontró la pizza" },
        { status: 404 }
      );
    }

    console.log("Pizza eliminada de Tabasco 🗑️");
    return NextResponse.json({ message: "Eliminado correctamente" });

  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar" },
      { status: 500 }
    );
  }
}