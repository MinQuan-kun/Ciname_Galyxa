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

const theaterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, default: "Hồ Chí Minh" },
  type: { type: String, enum: ['Standard', 'IMAX', 'Gold Class'], default: 'Standard' },
  totalSeats: { type: Number, default: 0 },
  
  seatMap: [seatSchema] 
}, { timestamps: true });

export default mongoose.model('Theater', theaterSchema);