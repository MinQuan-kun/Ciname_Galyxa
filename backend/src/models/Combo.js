import mongoose from 'mongoose';

const comboSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  price: { type: Number, required: true }, 
  items: { type: String },
  image: { type: String } 
});

export default mongoose.model('Combo', comboSchema);