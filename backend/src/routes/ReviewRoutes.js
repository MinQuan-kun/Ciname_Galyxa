import express from 'express';
import { addReview, getReviewsByMovie } from '../controllers/reviewController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ai cũng xem được đánh giá
router.get('/:movieId', getReviewsByMovie);

// Chỉ user đăng nhập mới được viết đánh giá
router.post('/', verifyToken, addReview);

export default router;