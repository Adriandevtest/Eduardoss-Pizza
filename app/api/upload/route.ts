import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireRole } from '@/lib/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const auth = await requireRole('admin');
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const url = await new Promise<string>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'pizzeria-eduardos' },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result.secure_url);
        }
      ).end(buffer);
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error subiendo imagen a Cloudinary:', error);
    return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 500 });
  }
}
