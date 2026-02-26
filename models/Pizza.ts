import mongoose, { Schema, model, models } from 'mongoose';

const PizzaSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, default: 'clasica' }, // Útil para filtrar en el Menú
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

// Esto evita crear el modelo dos veces si Next.js recarga el servidor
const Pizza = models.Pizza || model('Pizza', PizzaSchema);
export default Pizza;