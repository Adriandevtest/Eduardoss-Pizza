import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { name, email, password, role } = await request.json();

    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ error: "El correo ya está registrado" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, role });
    return NextResponse.json({ message: "Usuario creado con éxito", user: { name: newUser.name, email: newUser.email } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}