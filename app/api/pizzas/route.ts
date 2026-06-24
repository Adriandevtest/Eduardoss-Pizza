import { NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/mongodb';
import Pizza from '../../../models/Pizza';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    const pizzas = await Pizza.find({});
    return NextResponse.json(pizzas);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener las pizzas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireRole('admin');
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();
    const body = await request.json();
    const nuevaPizza = await Pizza.create(body);
    return NextResponse.json(nuevaPizza, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear la pizza" }, { status: 400 });
  }
}