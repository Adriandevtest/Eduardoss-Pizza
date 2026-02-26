import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await context.params;
    const body = await request.json();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role: body.role },
      { new: true }
    );

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