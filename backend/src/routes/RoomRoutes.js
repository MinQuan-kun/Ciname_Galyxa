import express from 'express';
import { createRoom, getRooms, updateRoom, deleteRoom } from '../controllers/roomController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- PUBLIC ROUTES  ---
router.get('/', getRooms);

// --- PROTECTED ROUTES  ---
router.post('/', verifyToken, isAdmin, createRoom);
router.put('/:id', verifyToken, isAdmin, updateRoom);
router.delete('/:id', verifyToken, isAdmin, deleteRoom);

export default router;