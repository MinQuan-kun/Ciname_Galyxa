import mongoose from 'mongoose';

const comboSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  items: { type: String },
  isHot: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Combo', comboSchema);