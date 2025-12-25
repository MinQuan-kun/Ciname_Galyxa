import Voucher from '../models/Voucher.js';
import VoucherRedemption from '../models/VoucherRedemption.js';
import User from '../models/User.js';
import crypto from 'crypto';

// Tạo mã voucher ngẫu nhiên
const generateVoucherCode = () => {
  return 'RW' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

// 1. Lấy danh sách phần thưởng có thể đổi (voucher có pointCost > 0)
export const getAvailableRewards = async (req, res) => {
  try {
    const rewards = await Voucher.find({ 
      pointCost: { $gt: 0 },
      isActive: true,
      quantity: { $gt: 0 },
      endDate: { $gte: new Date() }
    }).sort({ pointCost: 1 });
    
    res.status(200).json(rewards);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách phần thưởng', error: error.message });
  }
};

// 2. Đổi điểm lấy voucher
export const redeemReward = async (req, res) => {
  try {
    const { voucherId } = req.body;
    const userId = req.user.id;

    // Tìm voucher
    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({ message: 'Phần thưởng không tồn tại' });
    }

    if (!voucher.isActive) {
      return res.status(400).json({ message: 'Phần thưởng đã ngừng hoạt động' });
    }

    if (voucher.quantity <= 0) {
      return res.status(400).json({ message: 'Phần thưởng đã hết' });
    }

    if (new Date() > voucher.endDate) {
      return res.status(400).json({ message: 'Phần thưởng đã hết hạn' });
    }

    // Kiểm tra điểm user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    if (user.points < voucher.pointCost) {
      return res.status(400).json({ 
        message: `Bạn cần ${voucher.pointCost} điểm để đổi, hiện có ${user.points} điểm` 
      });
    }

    // Tạo mã voucher riêng cho user
    const voucherCode = generateVoucherCode();
    
    // Tính ngày hết hạn (theo voucher gốc)
    const expiresAt = voucher.endDate;

    // Tạo bản ghi đổi điểm
    const redemption = new VoucherRedemption({
      userId,
      voucherId,
      pointsSpent: voucher.pointCost,
      voucherCode,
      status: 'active',
      expiresAt
    });

    await redemption.save();

    // Trừ điểm user
    await User.findByIdAndUpdate(userId, { $inc: { points: -voucher.pointCost } });

    // Giảm số lượng voucher
    await Voucher.findByIdAndUpdate(voucherId, { $inc: { quantity: -1 } });

    res.status(201).json({ 
      message: 'Đổi điểm thành công!',
      redemption: {
        voucherCode,
        voucherName: voucher.name,
        discountType: voucher.discountType,
        value: voucher.value,
        expiresAt,
        pointsSpent: voucher.pointCost
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi đổi điểm', error: error.message });
  }
};

// 3. Lấy lịch sử đổi điểm của user
export const getMyRedemptions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const redemptions = await VoucherRedemption.find({ userId })
      .populate('voucherId', 'name description discountType value')
      .sort({ redeemedAt: -1 });
    
    res.status(200).json(redemptions);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy lịch sử đổi điểm', error: error.message });
  }
};

// 4. Lấy voucher chưa sử dụng của user
export const getMyActiveVouchers = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const vouchers = await VoucherRedemption.find({ 
      userId, 
      status: 'active',
      expiresAt: { $gte: new Date() }
    }).populate('voucherId', 'name description discountType value minOrderValue');
    
    res.status(200).json(vouchers);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy voucher', error: error.message });
  }
};

// 5. Kiểm tra và áp dụng mã voucher khi thanh toán
export const applyVoucher = async (req, res) => {
  try {
    const { voucherCode, orderValue } = req.body;
    const userId = req.user.id;

    // Tìm voucher redemption
    const redemption = await VoucherRedemption.findOne({ 
      voucherCode, 
      userId,
      status: 'active'
    }).populate('voucherId');

    if (!redemption) {
      return res.status(404).json({ message: 'Mã voucher không hợp lệ hoặc đã sử dụng' });
    }

    if (new Date() > redemption.expiresAt) {
      await VoucherRedemption.findByIdAndUpdate(redemption._id, { status: 'expired' });
      return res.status(400).json({ message: 'Mã voucher đã hết hạn' });
    }

    const voucher = redemption.voucherId;
    
    if (orderValue < voucher.minOrderValue) {
      return res.status(400).json({ 
        message: `Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN').format(voucher.minOrderValue)}đ` 
      });
    }

    // Tính số tiền được giảm
    let discountAmount = 0;
    if (voucher.discountType === 'percent') {
      discountAmount = Math.floor(orderValue * voucher.value / 100);
    } else {
      discountAmount = voucher.value;
    }

    // Không giảm quá giá trị đơn hàng
    discountAmount = Math.min(discountAmount, orderValue);

    res.status(200).json({
      valid: true,
      voucherCode,
      voucherName: voucher.name,
      discountType: voucher.discountType,
      value: voucher.value,
      discountAmount,
      finalPrice: orderValue - discountAmount
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi áp dụng voucher', error: error.message });
  }
};

// 6. Lấy tất cả lịch sử đổi điểm (Admin)
export const getAllRedemptions = async (req, res) => {
  try {
    const redemptions = await VoucherRedemption.find()
      .populate('userId', 'name email')
      .populate('voucherId', 'name pointCost')
      .sort({ redeemedAt: -1 });
    
    res.status(200).json(redemptions);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy lịch sử đổi điểm', error: error.message });
  }
};

// ===================== ADMIN CRUD VOUCHERS =====================

// 7. Lấy tất cả vouchers (Admin) - bao gồm cả inactive và hết hạn
export const getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.status(200).json(vouchers);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách voucher', error: error.message });
  }
};

// 8. Tạo voucher mới (Admin)
export const createVoucher = async (req, res) => {
  try {
    const { 
      code, name, description, discountType, value, 
      minOrderValue, pointCost, quantity, startDate, endDate, isActive 
    } = req.body;

    // Kiểm tra mã code đã tồn tại
    const existingVoucher = await Voucher.findOne({ code: code.toUpperCase() });
    if (existingVoucher) {
      return res.status(400).json({ message: 'Mã voucher đã tồn tại' });
    }

    const voucher = new Voucher({
      code: code.toUpperCase(),
      name,
      description,
      discountType: discountType || 'amount',
      value,
      minOrderValue: minOrderValue || 0,
      pointCost,
      quantity,
      startDate: startDate || Date.now(),
      endDate,
      isActive: isActive !== undefined ? isActive : true
    });

    await voucher.save();
    res.status(201).json({ message: 'Tạo voucher thành công', voucher });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo voucher', error: error.message });
  }
};

// 9. Cập nhật voucher (Admin)
export const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Nếu cập nhật code, kiểm tra xem code mới đã tồn tại chưa
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
      const existingVoucher = await Voucher.findOne({ 
        code: updateData.code, 
        _id: { $ne: id } 
      });
      if (existingVoucher) {
        return res.status(400).json({ message: 'Mã voucher đã tồn tại' });
      }
    }

    const voucher = await Voucher.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!voucher) {
      return res.status(404).json({ message: 'Không tìm thấy voucher' });
    }

    res.status(200).json({ message: 'Cập nhật voucher thành công', voucher });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật voucher', error: error.message });
  }
};

// 10. Xóa voucher (Admin)
export const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem voucher đã được đổi bởi user nào chưa
    const hasRedemptions = await VoucherRedemption.findOne({ voucherId: id });
    if (hasRedemptions) {
      return res.status(400).json({ 
        message: 'Không thể xóa voucher đã có người đổi. Hãy tắt trạng thái hoạt động thay vì xóa.' 
      });
    }

    const voucher = await Voucher.findByIdAndDelete(id);
    
    if (!voucher) {
      return res.status(404).json({ message: 'Không tìm thấy voucher' });
    }

    res.status(200).json({ message: 'Xóa voucher thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa voucher', error: error.message });
  }
};
