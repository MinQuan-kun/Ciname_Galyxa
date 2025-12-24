import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  seats: { type: [String], required: true },
  combos: [
    {
      comboId: { type: mongoose.Schema.Types.ObjectId, ref: 'Combo' },
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  totalPrice: { type: Number, required: true },
  originalPrice: { type: Number },           // Giá gốc trước giảm (để tính điểm)
  voucherCode: { type: String },             // Mã voucher đã dùng
  discountAmount: { type: Number, default: 0 }, // Số tiền được giảm
  pointsEarned: { type: Number, default: 0 },   // Điểm đã nhận
  paymentMethod: { type: String, default: 'Bank' },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled'], 
    default: 'pending' 
  }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);