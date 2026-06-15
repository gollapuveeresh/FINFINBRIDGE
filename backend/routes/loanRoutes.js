import express from 'express';
import {
  createLoan,
  getLoans,
  getLoanById,
  updateLoan,
  deleteLoan
} from '../controllers/loanController.js';
import { protect } from '../middlewares/authMiddleware.js';

import { validate } from '../validators/validateMiddleware.js';
import { createLoanSchema, updateLoanSchema } from '../validators/loanValidator.js';

const router = express.Router();

// Apply protect middleware to all routes in this router
router.use(protect);

// Create and Read (List) routes
router.route('/')
  .post(validate(createLoanSchema), createLoan)
  .get(getLoans);

// Detail, Update, and Delete routes
router.route('/:id')
  .get(getLoanById)
  .put(validate(updateLoanSchema), updateLoan)
  .delete(deleteLoan);

export default router;
