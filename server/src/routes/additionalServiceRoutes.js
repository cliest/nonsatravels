import express from 'express';
import { getServices, getAllServices, createService, updateService, deleteService, seedServices } from '../controllers/additionalServiceController.js';
import { verifyAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getServices);
router.get('/admin', verifyAuth, requireAdmin, getAllServices);
router.post('/', verifyAuth, requireAdmin, createService);
router.post('/seed', verifyAuth, requireAdmin, seedServices);
router.put('/:id', verifyAuth, requireAdmin, updateService);
router.delete('/:id', verifyAuth, requireAdmin, deleteService);

export default router;
