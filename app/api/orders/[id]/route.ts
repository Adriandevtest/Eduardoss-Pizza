import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    // En Next 16 params es Promise
    const { id } = await context.params;

    const { status } = await request.json();

    console.log("Actualizando pedido en Tabasco:", id);

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedOrder);

  } catch (error) {
    console.error("Error en PATCH:", error);
    return NextResponse.json(
      { error: "Fallo en el servidor" },
      { status: 500 }
    );
  }
}