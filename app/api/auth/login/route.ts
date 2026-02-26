import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect(); // Si esto falla, saltará al catch
    const { email, password } = await request.json();

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role // Vital para que aparezca el botón de Cocina/Admin
    });
  } catch (error) {
    console.error("Fallo de conexión en Tabasco:", error);
    return NextResponse.json({ error: "Error de conexión con la base de datos" }, { status: 500 });
  }
}