import express from 'express';
import { createMovie, getMovies, getMovieById } from '../controllers/movieController.js';
import { upload } from '../config/cloudinary.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- PUBLIC ROUTES  ---
router.get('/', getMovies);

router.get('/:id', getMovieById);


// --- PROTECTED ROUTES  ---
// POST /api/movies -> Thêm phim mới

router.post('/', verifyToken, isAdmin, upload.single('poster'), createMovie);

export default router;