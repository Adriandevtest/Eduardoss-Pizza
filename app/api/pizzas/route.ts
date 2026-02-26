import { NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/mongodb';
import Pizza from '../../../models/Pizza';

export async function GET() {
  try {
    await dbConnect(); // Conectamos a la base de datos
    const pizzas = await Pizza.find({}); // Buscamos todas las pizzas en MongoDB
    return NextResponse.json(pizzas);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener las pizzas" }, { status: 500 });
  }
}

// Opcional: Una función POST para que puedas agregar pizzas desde herramientas como Postman
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const nuevaPizza = await Pizza.create(body);
    return NextResponse.json(nuevaPizza, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear la pizza" }, { status: 400 });
  }
}