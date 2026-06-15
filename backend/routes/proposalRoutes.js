import express from 'express';
import {
  createProposal, getProposals, getProposalById, updateProposal, deleteProposal
} from '../controllers/proposalController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', protect, getProposals);
router.post('/', protect, authorize('consultant'), createProposal);
router.get('/:id', protect, getProposalById);
router.patch('/:id', protect, updateProposal);
router.delete('/:id', protect, authorize('consultant', 'admin'), deleteProposal);

export default router;
