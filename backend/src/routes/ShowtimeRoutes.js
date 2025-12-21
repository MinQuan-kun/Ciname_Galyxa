import express from 'express';
import { getShowtimes, createShowtime, deleteShowtime, updateShowTime} from '../controllers/showtimeController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
const router = express.Router();

// --- PUBLIC ROUTES  ---
router.get('/:movieId', getShowtimes);

// --- PROTECTED ROUTES  ---
// router.post('/', verifyToken, isAdmin, createShowtime);
router.post('/', createShowtime);
router.put('/:id', verifyToken, isAdmin, updateShowTime);
router.delete('/:id', verifyToken, isAdmin, deleteShowtime);

export default router;