import express from 'express';
import { createMovie, getMovies, getMovieById } from '../controllers/movieController.js';

const router = express.Router();

// GET /api/movies -> Lấy danh sách phim
router.get('/', getMovies);

// GET /api/movies/:id -> Lấy chi tiết 1 phim
router.get('/:id', getMovieById);

// POST /api/movies -> Thêm phim mới (Tạm thời mở public để test, sau này thêm middleware check Admin sau)
router.post('/', createMovie);

export default router;