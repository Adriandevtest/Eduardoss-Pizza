import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

export async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;

  try {
    // Añadimos un timeout de 5 segundos para que no se quede "colgado"
    await mongoose.connect(MONGODB_URI!, {
      serverSelectionTimeoutMS: 5000, 
    });
    console.log("Conectado a MongoDB en Tabasco 🍕");
  } catch (error) {
    console.error("Error de conexión:", error);
    throw new Error("No se pudo conectar a la base de datos");
  }
}