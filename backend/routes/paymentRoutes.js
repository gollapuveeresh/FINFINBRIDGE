import express from 'express';
import { createOrder, verifyPayment, handleWebhook, getPayments, refundPayment, getPaymentStats } from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Webhook must receive raw body for signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

router.get('/stats',        protect, authorize('admin','department-admin'), getPaymentStats);
router.get('/',             protect, getPayments);
router.post('/create-order',protect, authorize('client'), createOrder);
router.post('/verify',      protect, authorize('client'), verifyPayment);
router.post('/:id/refund',  protect, authorize('admin','department-admin'), refundPayment);

export default router;
