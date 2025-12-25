import express from 'express';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import {
  getAvailableRewards,
  redeemReward,
  getMyRedemptions,
  getMyActiveVouchers,
  applyVoucher,
  getAllRedemptions,
  getAllVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher
} from '../controllers/rewardController.js';

const router = express.Router();

// Public - Lấy danh sách phần thưởng có thể đổi
router.get('/', getAvailableRewards);

// User routes (cần đăng nhập)
router.post('/redeem', verifyToken, redeemReward);
router.get('/my-redemptions', verifyToken, getMyRedemptions);
router.get('/my-vouchers', verifyToken, getMyActiveVouchers);
router.post('/apply-voucher', verifyToken, applyVoucher);

// Admin routes
router.get('/all-redemptions', verifyToken, isAdmin, getAllRedemptions);
router.get('/admin/vouchers', verifyToken, isAdmin, getAllVouchers);
router.post('/admin/vouchers', verifyToken, isAdmin, createVoucher);
router.put('/admin/vouchers/:id', verifyToken, isAdmin, updateVoucher);
router.delete('/admin/vouchers/:id', verifyToken, isAdmin, deleteVoucher);

export default router;
