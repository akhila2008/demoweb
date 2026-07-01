import { Router } from 'express';
import { createOrder, verifyPayment, getMyOrders } from '../controllers/orderController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.route('/')
  .post(protect, createOrder);

router.post('/verify-payment', protect, verifyPayment);
router.get('/myorders', protect, getMyOrders);

export default router;
