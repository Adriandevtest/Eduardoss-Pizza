import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // En producción usaremos encriptación
  address: { type: String, default: '' },
  role: { type: String, default: 'client' } // 'client' o 'admin'
}, { timestamps: true });

const User = models.User || model('User', UserSchema);
export default User;