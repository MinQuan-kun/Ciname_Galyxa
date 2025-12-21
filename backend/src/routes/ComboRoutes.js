import express from 'express';
import { getCombos, createCombo, deleteCombo } from '../controllers/comboController.js';
import {upload} from '../config/cloudinary.js'; // Hoặc đường dẫn file cấu hình multer của bạn

const router = express.Router();

router.get('/', getCombos);
router.post('/', upload.single('image'), createCombo);
router.delete('/:id', deleteCombo);

export default router;