import express from 'express';
import { getDestinations, getAllDestinations, createDestination, updateDestination, deleteDestination, seedDestinations } from '../controllers/destinationController.js';
import { verifyAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDestinations);
router.get('/admin', verifyAuth, requireAdmin, getAllDestinations);
router.post('/', verifyAuth, requireAdmin, createDestination);
router.post('/seed', verifyAuth, requireAdmin, seedDestinations);
router.put('/:id', verifyAuth, requireAdmin, updateDestination);
router.delete('/:id', verifyAuth, requireAdmin, deleteDestination);

export default router;
