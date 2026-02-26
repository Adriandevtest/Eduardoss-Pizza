import { NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/mongodb';
import User from '../../../models/User';

export async function GET() {
  try {
    await dbConnect();
    // Traemos todos los usuarios pero excluimos la contraseña por seguridad
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}