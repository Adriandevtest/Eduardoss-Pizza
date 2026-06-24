import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Order from '@/models/Order';

// Endpoint público — solo devuelve un rango de tiempo, sin datos de pedidos
export async function GET() {
  try {
    await dbConnect();
    const active = await Order.countDocuments({
      status: { $in: ['pendiente', 'pagado', 'listo'] },
    });

    const [min, max] = active <= 2 ? [20, 30] : active <= 5 ? [30, 45] : [45, 60];
    return NextResponse.json({ min, max });
  } catch {
    return NextResponse.json({ min: 30, max: 45 });
  }
}
