import mongoose, { Schema, model, models } from 'mongoose';

const OrderSchema = new Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String },
  items: [
    {
      name: String,
      quantity: Number,
      price: Number,
    }
  ],
  total: { type: Number, required: true },
  status: { type: String, default: 'pendiente' },
  createdAt: { type: Date, default: Date.now }
});

// Esta línea es vital: usa el modelo existente o crea uno nuevo
const Order = models.Order || model('Order', OrderSchema);
export default Order;