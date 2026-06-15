import express from 'express';
import {
  createInvestment,
  getInvestments,
  getInvestmentById,
  updateInvestment,
  deleteInvestment,
  getInvestmentSummary,
  getInvestmentHistory
} from '../controllers/investmentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../validators/validateMiddleware.js';
import { createInvestmentSchema, updateInvestmentSchema } from '../validators/investmentValidator.js';

const router = express.Router();

// Enforce auth shield
router.use(protect);

router.route('/summary').get(getInvestmentSummary);
router.route('/history').get(getInvestmentHistory);

router.route('/')
  .post(validate(createInvestmentSchema), createInvestment)
  .get(getInvestments);

router.route('/:id')
  .get(getInvestmentById)
  .put(validate(updateInvestmentSchema), updateInvestment)
  .delete(deleteInvestment);

export default router;
