// app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Order from '@/models/Order';

// PARA LA COCINA: Obtener todos los pedidos
export async function GET() {
  try {
    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json(orders || []);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 });
  }
}

// PARA EL CARRITO: Crear un nuevo pedido
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Validamos que vengan productos
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: "El pedido está vacío" }, { status: 400 });
    }

    const newOrder = await Order.create({
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      items: body.items,
      total: body.total,
      status: 'pendiente',
      createdAt: new Date()
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/orders:", error);
    return NextResponse.json({ error: "No se pudo guardar el pedido en Tabasco" }, { status: 500 });
  }
}