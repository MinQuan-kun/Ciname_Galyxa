import express from 'express';
import { createMovie, getMovies, getMovieById, deleteMovie, updateMovie } from '../controllers/movieController.js';
import { upload } from '../config/cloudinary.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- PUBLIC ROUTES  ---
router.get('/', getMovies);

router.get('/:id', getMovieById);


// --- PROTECTED ROUTES  ---
router.post('/', 
    verifyToken, 
    isAdmin, 
    upload.fields([
        { name: 'poster', maxCount: 1 }, 
        { name: 'banner', maxCount: 1 }
    ]), 
    createMovie
);

router.delete('/:id', verifyToken, isAdmin, deleteMovie);

router.put('/:id', 
    verifyToken, 
    isAdmin, 
    upload.fields([{ name: 'poster' }, { name: 'banner' }]), 
    updateMovie
);

export default router;