import express from 'express';
// Nhớ import thêm hàm getAllShowtimes vừa viết
import { getShowtimes, createShowtime, deleteShowtime, updateShowTime, getShowtimeById, getAllShowtimes } from '../controllers/showtimeController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- PUBLIC ROUTES  ---

// 1. Route lấy TẤT CẢ lịch chiếu (Nhóm theo phim) - Đặt lên đầu
router.get('/', getAllShowtimes); 

// 2. Route lấy chi tiết 1 lịch chiếu (để sửa)
router.get('/detail/:id', getShowtimeById);

// 3. Route lấy lịch chiếu THEO PHIM (cái cũ của bạn)
router.get('/:movieId', getShowtimes);


// --- PROTECTED ROUTES  ---
router.post('/', createShowtime); // Nếu bạn đã bỏ verifyToken để test thì giữ nguyên, còn không thì thêm lại
router.put('/:id', verifyToken, isAdmin, updateShowTime);
router.delete('/:id', verifyToken, isAdmin, deleteShowtime);

export default router;