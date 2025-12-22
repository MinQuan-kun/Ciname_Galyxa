import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isLocked: { type: Boolean, default: false },
  points: { type: Number, default: 0 },
  avatar: { type: String }, // URL to avatar image

}, { timestamps: true });

export default mongoose.model('User', userSchema);