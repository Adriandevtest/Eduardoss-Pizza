import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Order from '@/models/Order'; // Asegúrate de que apunte bien a tu modelo

// ACTUALIZAR ESTADO DEL PEDIDO (PATCH)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error en PATCH /api/orders/[id]:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

// ELIMINAR PEDIDO (DELETE) - Por si lo necesitas después
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const deletedOrder = await Order.findByIdAndDelete(id);
    
    if (!deletedOrder) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Eliminado" });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}