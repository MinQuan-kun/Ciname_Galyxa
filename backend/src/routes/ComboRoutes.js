import express from 'express';
import { getCombos, createCombo, deleteCombo,updateCombo } from '../controllers/comboController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import {upload} from '../config/cloudinary.js';
const router = express.Router();

// --- PUBLIC ROUTES  ---
router.get('/', getCombos);

// --- PROTECTED ROUTES  ---
router.post('/', verifyToken, isAdmin, upload.single('image'), createCombo);
router.delete('/:id', verifyToken, isAdmin, deleteCombo);
router.put('/:id', verifyToken, isAdmin, updateCombo);
export default router;