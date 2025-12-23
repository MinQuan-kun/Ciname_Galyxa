import express from 'express';
import { getSummaryStats, getRevenueChart, getTopMovies } from '../controllers/statsController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
const router = express.Router();

router.get('/summary', verifyToken, isAdmin, getSummaryStats);
router.get('/revenue-chart', verifyToken, isAdmin, getRevenueChart);
router.get('/top-movies', verifyToken, isAdmin, getTopMovies);

export default router;