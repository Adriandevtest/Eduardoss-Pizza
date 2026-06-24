import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireRole } from '@/lib/auth';

const STAFF_ROLES = ['admin', 'cajero', 'cocina', 'repartidor'];

// ACTUALIZAR ESTADO DEL PEDIDO (PATCH)
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(...STAFF_ROLES);
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();
    const { id } = await context.params;
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

// ELIMINAR PEDIDO (DELETE)
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRole('admin');
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();
    const { id } = await context.params;

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Eliminado" });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}