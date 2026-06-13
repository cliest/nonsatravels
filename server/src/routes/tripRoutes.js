import express from 'express';
import {
  getMyTrips,
  getTripById,
  getTripByToken,
  createTrip,
  updateTrip,
  deleteTrip,
  generateShareLink,
  addDestination,
  addActivity,
} from '../controllers/tripController.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/shared/:token', getTripByToken);

// Protected routes
router.use(verifyAuth);

router.get('/', getMyTrips);
router.post('/', createTrip);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.post('/:id/share', generateShareLink);
router.post('/:id/destinations', addDestination);
router.post('/:id/destinations/:destinationId/activities', addActivity);

export default router;
