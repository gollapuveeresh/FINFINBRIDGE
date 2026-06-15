import express from 'express';
import {
  getRecommendations,
  createRecommendation,
  deleteRecommendation,
} from '../controllers/recommendationController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('consultant'));

router.get('/', getRecommendations);
router.post('/', createRecommendation);
router.delete('/:id', deleteRecommendation);

export default router;
