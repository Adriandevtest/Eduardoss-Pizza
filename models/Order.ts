import mongoose, { Schema, model, models } from 'mongoose';

const OrderSchema = new Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String },
  customerPhone: { type: String, default: 'N/A' },
  deliveryAddress: { type: String, default: 'Mostrador' },
  items: [
    {
      name: String,
      quantity: Number,
      price: Number,
    }
  ],
  total: { type: Number, required: true },
  status: { type: String, default: 'pendiente' },
  paymentMethod: { type: String, default: 'efectivo' },
  notes: { type: String, default: '' },
  sucursal: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Esta línea es vital: usa el modelo existente o crea uno nuevo
const Order = models.Order || model('Order', OrderSchema);
export default Order;