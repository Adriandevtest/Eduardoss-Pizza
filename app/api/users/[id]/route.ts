import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import { requireRole } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole('admin');
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();

    const { id } = await context.params;
    const body = await request.json();

    const update: Record<string, string> = {};
    if (body.role !== undefined) update.role = body.role;
    if (body.sucursal !== undefined) update.sucursal = body.sucursal;

    const updatedUser = await User.findByIdAndUpdate(id, update, { new: true });

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Rol actualizado",
      user: updatedUser
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar el usuario" },
      { status: 500 }
    );
  }
}