import express from 'express';
import { getCombos, getComboById, createCombo, updateCombo, deleteCombo } from '../controllers/comboController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import {upload} from '../config/cloudinary.js';
const router = express.Router();

// --- PUBLIC ROUTES  ---
router.get('/', getCombos);
router.get('/:id', getComboById);
// --- PROTECTED ROUTES  ---
router.post('/', verifyToken, isAdmin, upload.single('image'), createCombo);
router.delete('/:id', verifyToken, isAdmin, deleteCombo);
router.put('/:id', upload.single('image'), updateCombo);
export default router;