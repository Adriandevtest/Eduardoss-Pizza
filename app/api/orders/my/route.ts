import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireRole } from '@/lib/auth';

export async function GET() {
  // Cualquier usuario autenticado puede ver sus propios pedidos
  const auth = await requireRole();
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();
    const orders = await Order.find({ customerEmail: auth.email })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('items total status deliveryAddress sucursal createdAt paymentMethod');

    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: 'Error al obtener historial' }, { status: 500 });
  }
}
