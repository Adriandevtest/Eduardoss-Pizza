import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SECRET = process.env.JWT_SECRET!;

export interface TokenPayload {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

// Verifica el JWT de la cookie y comprueba el rol.
// Devuelve el payload si es válido, o un NextResponse de error si no.
export async function requireRole(...roles: string[]): Promise<TokenPayload | NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, SECRET) as TokenPayload;
    if (roles.length > 0 && !roles.includes(payload.role)) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }
    return payload;
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
}
