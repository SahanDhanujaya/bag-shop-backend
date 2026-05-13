import express from 'express';
import multer from 'multer';
import { saveBag, updateBag, getBags, getBagById, deleteBag } from '../controllers/bag.controller.ts';
import { authenticateUser } from '../middlewares/authMiddleware.ts';

const router = express.Router();

// Configuration for Multer
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Use upload.array('image', 5) for multiple files
router.post('/', authenticateUser, upload.array('image', 5), saveBag);
router.put('/:id', authenticateUser, upload.array('image', 5), updateBag);

// Standard routes
router.get('/', getBags);
router.get('/:id', getBagById);
router.delete('/:id', authenticateUser, deleteBag);

export default router;