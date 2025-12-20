import express from 'express';
import { getAllUsers, updateUser, deleteUser, updateProfile } from '../controllers/UserController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js'; //
import { upload } from '../config/cloudinary.js';
const router = express.Router();


// --- PUBLIC ROUTES  ---
router.put('/profile', verifyToken, upload.single('avatar'), updateProfile);

// --- PROTECTED ROUTES  ---
router.get('/', verifyToken, isAdmin, getAllUsers);
router.put('/:id', verifyToken, isAdmin, updateUser);
router.delete('/:id', verifyToken, isAdmin, deleteUser);

export default router;