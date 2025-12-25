import express from 'express';
import { 
  createReview, 
  updateReview, 
  deleteReview, 
  toggleInteraction,
  getTopMoviesWithReviews, 
  getReviewsByMovie,
  getMyReviews
} from '../controllers/reviewController.js';
import { verifyToken } from '../middleware/authMiddleware.js'; // Nhớ import middleware auth của bạn

const router = express.Router();

// Public Routes (Ai cũng xem được)
router.get('/top-movies', getTopMoviesWithReviews); // Lấy top 5 phim + review nổi bật
router.get('/movie/:movieId', getReviewsByMovie);   // Lấy danh sách review của 1 phim (kèm phân trang)

// Protected Routes (Cần đăng nhập)
router.post('/', verifyToken, createReview);           // Tạo review
router.get('/my-reviews', verifyToken, getMyReviews); // Lấy danh sách review của user hiện tại
router.put('/:id', verifyToken, updateReview);         // Sửa review
router.delete('/:id', verifyToken, deleteReview);      // Xóa review
router.post('/:id/interact', verifyToken, toggleInteraction); // Like review

export default router;