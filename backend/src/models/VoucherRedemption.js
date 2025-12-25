import mongoose from 'mongoose';

const voucherRedemptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  voucherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', required: true },
  pointsSpent: { type: Number, required: true },
  voucherCode: { type: String, required: true, unique: true }, // Mã voucher được cấp
  status: { 
    type: String, 
    enum: ['active', 'used', 'expired'], 
    default: 'active' 
  },
  redeemedAt: { type: Date, default: Date.now },
  usedAt: { type: Date },
  expiresAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('VoucherRedemption', voucherRedemptionSchema);
