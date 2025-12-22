import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  points: { type: Number, default: 0 },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isLocked: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('User', userSchema);