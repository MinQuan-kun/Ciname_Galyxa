import express from 'express';
import { createShowtime, getShowtimesByMovie } from '../controllers/showtimeController.js';

const router = express.Router();

// GET /api/showtimes/:movieId -> Lấy lịch chiếu của 1 phim
router.get('/:movieId', getShowtimesByMovie);

// POST /api/showtimes -> Tạo suất chiếu
router.post('/', createShowtime);

export default router;