import express from 'express';
import {
  createConsultation,
  getConsultations,
  acceptConsultation,
  assignConsultation
} from '../controllers/consultationController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createConsultation)
  .get(getConsultations);

router.route('/:id/accept')
  .patch(acceptConsultation);

router.route('/:id/assign')
  .patch(authorize('department-admin', 'admin'), assignConsultation);

export default router;
