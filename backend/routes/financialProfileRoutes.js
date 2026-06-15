import express from 'express';
import {
  createProfile,
  getMyProfile,
  getProfileByClientId,
  getAllProfiles,
  updateMyProfile,
  deleteMyProfile,
  deleteProfileByClientId
} from '../controllers/financialProfileController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

import { validate } from '../validators/validateMiddleware.js';
import { financialProfileSchema } from '../validators/financialProfileValidator.js';

const router = express.Router();

// Apply protect middleware to all routes in this router
router.use(protect);

// Client-specific profile operations
router.route('/')
  .post(authorize('client'), validate(financialProfileSchema), createProfile)
  .get(authorize('client'), getMyProfile)
  .put(authorize('client'), validate(financialProfileSchema), updateMyProfile)
  .delete(authorize('client'), deleteMyProfile);

// Admin-only: Get all profiles
router.get('/all', authorize('admin'), getAllProfiles);

// Admin and Consultant: Get specific client profile
router.get('/client/:clientId', authorize('admin', 'consultant'), getProfileByClientId);

// Admin-only: Delete specific client profile
router.delete('/client/:clientId', authorize('admin'), deleteProfileByClientId);

export default router;
