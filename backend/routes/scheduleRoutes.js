import express from 'express';
import { scheduleEmailReminder, cancelEmailReminder } from '../controllers/scheduleController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('consultant'));

router.post('/reminders', scheduleEmailReminder);
router.delete('/reminders/:meetingId', cancelEmailReminder);

export default router;
