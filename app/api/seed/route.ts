import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';
import { requireRole } from '@/lib/auth';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'No disponible' }, { status: 403 });
  }

  const auth = await requireRole('admin');
  if (auth instanceof NextResponse) return auth;

  await seedDatabase();
  return NextResponse.json({ message: "Base de datos poblada correctamente" });
}