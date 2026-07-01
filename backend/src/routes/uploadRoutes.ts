import { Router, Request, Response } from 'express';
import { upload } from '../utils/cloudinary';
import { protect, admin } from '../middleware/authMiddleware';

const router = Router();

// Endpoint for single image upload
router.post('/', protect, admin, upload.single('image'), (req: Request, res: Response) => {
  if (req.file) {
    res.json({
      message: 'Image uploaded successfully',
      imageUrl: req.file.path,
    });
  } else {
    res.status(400).json({ message: 'Image upload failed' });
  }
});

// Endpoint for multiple image uploads (e.g. for saree gallery)
router.post('/multiple', protect, admin, upload.array('images', 10), (req: Request, res: Response) => {
  if (req.files && Array.isArray(req.files)) {
    const imageUrls = req.files.map((file: Express.Multer.File) => file.path);
    res.json({
      message: 'Images uploaded successfully',
      imageUrls,
    });
  } else {
    res.status(400).json({ message: 'Images upload failed' });
  }
});

export default router;
