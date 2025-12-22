import express from 'express';
import { 
    getAllUsers, 
    updateUser, 
    deleteUser, 
    updateProfile, 
    getProfile, 
    getUserById 
} from '../controllers/UserController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// ==========================================
// 1. DÀNH CHO NGƯỜI DÙNG (Cá nhân)
// ==========================================

// Lấy thông tin cá nhân của chính mình
router.get('/profile', verifyToken, getProfile);

// Cập nhật thông tin cá nhân & Avatar
router.put('/profile', verifyToken, upload.single('avatar'), updateProfile);


// ==========================================
// 2. DÀNH CHO ADMIN (Quản lý)
// ==========================================

// Lấy tất cả danh sách người dùng
router.get('/', verifyToken, isAdmin, getAllUsers);

// Lấy chi tiết 1 người dùng theo ID (Admin quản lý)
router.get('/:id', verifyToken, isAdmin, getUserById);

// Admin cập nhật trạng thái/Role người dùng
router.put('/:id', verifyToken, isAdmin, updateUser);

// Admin xóa người dùng
router.delete('/:id', verifyToken, isAdmin, deleteUser);

export default router;