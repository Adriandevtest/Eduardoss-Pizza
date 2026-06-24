import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    const user = await User.findOne({ email });

    const isValid = user && await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    const payload = { _id: String(user._id), name: user.name, email: user.email, role: user.role };
    const token = signToken(payload);

    const response = NextResponse.json(payload);
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    });

    return response;
  } catch (error) {
    console.error("Fallo de conexión en Tabasco:", error);
    return NextResponse.json({ error: "Error de conexión con la base de datos" }, { status: 500 });
  }
}