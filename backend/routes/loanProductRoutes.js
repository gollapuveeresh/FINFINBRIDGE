import express from 'express';
import {
  getLoanRecommendations,
  getLoanProductAnalytics,
  createLoanProduct,
  getLoanProducts,
  getLoanProductById,
  updateLoanProduct,
  deleteLoanProduct
} from '../controllers/loanProductController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../validators/validateMiddleware.js';
import { createLoanProductSchema, updateLoanProductSchema } from '../validators/loanProductValidator.js';

const router = express.Router();

// Enforce auth shielding
router.use(protect);

// Recommendations endpoint for clients
router.route('/recommendations').get(getLoanRecommendations);

// Analytics endpoint (Admin only)
router.route('/analytics').get(getLoanProductAnalytics);

// Admin CRUD routes
router.route('/')
  .post(validate(createLoanProductSchema), createLoanProduct)
  .get(getLoanProducts);

router.route('/:id')
  .get(getLoanProductById)
  .put(validate(updateLoanProductSchema), updateLoanProduct)
  .delete(deleteLoanProduct);

export default router;
