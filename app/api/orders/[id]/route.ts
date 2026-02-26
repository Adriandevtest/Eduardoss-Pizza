import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Pizza from '@/models/Pizza';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    return NextResponse.json(updatedPizza);

  } catch (error) {
    console.error("Error en PUT:", error);
    return NextResponse.json(
      { error: "Error al actualizar pizza" },
      { status: 500 }
    );
  }
}