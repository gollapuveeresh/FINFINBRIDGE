import express from 'express';
import { getCaseNotes, saveOrUpdateNote, deleteCaseNote } from '../controllers/caseNoteController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// All routes require authentication and consultant role
router.use(protect);
router.use(authorize('consultant'));

router.get('/', getCaseNotes);
router.post('/', saveOrUpdateNote);
router.delete('/:clientId', deleteCaseNote);

export default router;
