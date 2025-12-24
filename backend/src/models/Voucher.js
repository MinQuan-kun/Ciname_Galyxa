import mongoose from 'mongoose';

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true }, // Mã code (VD: TET2025)
  name: { type: String, required: true }, // Tên hiển thị (Voucher 50k)
  description: { type: String },
  
  discountType: { type: String, enum: ['amount', 'percent'], default: 'amount' }, // Giảm tiền hay %
  value: { type: Number, required: true }, // Giá trị giảm (50000 hoặc 10%)
  minOrderValue: { type: Number, default: 0 }, // Đơn tối thiểu để dùng
  
  pointCost: { type: Number, required: true }, // Số điểm cần để đổi
  quantity: { type: Number, required: true, min: 0 }, // Số lượng trong kho
  
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Voucher', voucherSchema);