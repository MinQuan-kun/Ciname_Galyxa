import mongoose from 'mongoose';

const showtimeSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  theaterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
  startTime: { type: Date, required: true },
  ticketPrice: { type: Number, required: true },
  // Mảng lưu các ghế đã bị đặt. Ví dụ: ["A1", "A2", "B5"]
  bookedSeats: { 
    type: [String], 
    default: [] 
  }
}, { timestamps: true });

export default mongoose.model('Showtime', showtimeSchema);