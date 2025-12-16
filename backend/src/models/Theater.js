import mongoose from 'mongoose';

const theaterSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  location: { type: String, default: "Hồ Chí Minh" },
  seatMap: {
    rows: { type: Number, required: true }, 
    cols: { type: Number, required: true }, 
  }
}, { timestamps: true });

export default mongoose.model('Theater', theaterSchema);