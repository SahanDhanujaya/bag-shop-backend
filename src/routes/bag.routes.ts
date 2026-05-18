import express from 'express';
import multer from 'multer';
import path from 'path';
import { saveBag, updateBag, getBags, getBagById, deleteBag } from '../controllers/bag.controller.ts';
import { authenticateUser, authorizeRole } from '../middlewares/authMiddleware.ts';

const router = express.Router();

// ─── Multer storage ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {
    // Sanitize original filename to avoid spaces / special chars in the URL
    const safe = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const validExt  = allowed.test(path.extname(file.originalname).toLowerCase());
    const validMime = allowed.test(file.mimetype);
    if (validExt && validMime) {
      cb(null, true);
    } else {
      cb(new Error('Images only (jpeg / jpg / png / webp / gif)'));
    }
  },
});

// ─── Routes ───────────────────────────────────────────────────────────────────
// Field name is "images" — must match:
//   • frontend:   formData.append("images", file)
//   • controller: req.files as Express.Multer.File[]  (via upload.array)
router.post( '/',    authenticateUser, authorizeRole('admin'), upload.array('images', 5), saveBag);
router.put(  '/:id', authenticateUser, authorizeRole('admin'), upload.array('images', 5), updateBag);

router.get(   '/',    getBags);
router.get(   '/:id', getBagById);
router.delete('/:id', authenticateUser, authorizeRole('admin'), deleteBag);

export default router;