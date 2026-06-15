import express from 'express';
import { createInvoice, getInvoices, getInvoiceById, updateInvoice, getInvoiceStats } from '../controllers/invoiceController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin','department-admin','crm-admin'), getInvoiceStats);
router.get('/',      protect, getInvoices);
router.post('/',     protect, authorize('consultant'), createInvoice);
router.get('/:id',   protect, getInvoiceById);
router.patch('/:id', protect, authorize('consultant','admin','department-admin'), updateInvoice);

export default router;
