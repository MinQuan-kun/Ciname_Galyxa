import express from 'express';
import { createBooking, getMyBookings } from '../controllers/bookingController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Đặt vé mới (Yêu cầu đăng nhập)
router.post('/', verifyToken, createBooking);

router.get('/my-bookings', verifyToken, getMyBookings);

export default router;