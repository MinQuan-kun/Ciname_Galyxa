import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
  id: { type: String, required: true },
  row: { type: String, required: true },
  number: { type: Number, required: true }, 
  type: { 
    type: String, 
    enum: ['Standard', 'VIP', 'Couple', 'Hidden'], 
    default: 'Standard' 
  },
  priceSurcharge: { type: Number, default: 0 }
}, { _id: false });

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  type: { 
    type: String, 
    enum: ['Standard', 'IMAX', 'Gold Class', '4DX', 'Sweetbox'], 
    default: 'Standard' 
  },
  totalSeats: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Maintenance'], default: 'Active' },
  
  seatMap: [seatSchema] 
  
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);