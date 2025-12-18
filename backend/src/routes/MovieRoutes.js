import express from 'express';
import { createMovie, getMovies, getMovieById } from '../controllers/movieController.js';
import { upload } from '../config/cloudinary.js';
const router = express.Router();

// GET /api/movies -> Lấy danh sách phim
router.get('/', getMovies);

// GET /api/movies/:id -> Lấy chi tiết 1 phim
router.get('/:id', getMovieById);

router.post('/', upload.single('poster'), createMovie);

export default router;