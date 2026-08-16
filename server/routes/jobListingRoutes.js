import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getJobListings,
  getJobListingById,
  triggerJobSync,
  saveJobListingToTracker,
} from '../controllers/jobListingController.js';

const router = express.Router();

router.get('/', protect, getJobListings);
router.post('/sync', protect, triggerJobSync);
router.get('/:id', protect, getJobListingById);
router.post('/:id/save', protect, saveJobListingToTracker);

export default router;
