import { NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/mongodb';
import User from '../../../models/User';
import { requireRole } from '@/lib/auth';

export async function GET() {
  const auth = await requireRole('admin');
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();
    // Traemos todos los usuarios pero excluimos la contraseña por seguridad
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}