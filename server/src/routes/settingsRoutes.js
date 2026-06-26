import express from 'express';
import { getSetting, getAllSettings, upsertSetting, deleteSetting } from '../controllers/settingsController.js';
import { verifyAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/:key', getSetting);
router.get('/', verifyAuth, requireAdmin, getAllSettings);
router.put('/', verifyAuth, requireAdmin, upsertSetting);
router.delete('/:key', verifyAuth, requireAdmin, deleteSetting);

export default router;
