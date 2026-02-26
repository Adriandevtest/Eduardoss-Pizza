import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { name, email, password } = await request.json();

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ error: "El correo ya está registrado" }, { status: 400 });
    }

    // Crear el nuevo usuario
    const newUser = await User.create({ name, email, password });
    return NextResponse.json({ message: "Usuario creado con éxito", user: { name: newUser.name, email: newUser.email } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}