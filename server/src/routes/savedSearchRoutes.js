import express from 'express';
import { createSavedSearch, getMySavedSearches, deleteSavedSearch } from '../controllers/savedSearchController.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyAuth, createSavedSearch);
router.get('/', verifyAuth, getMySavedSearches);
router.delete('/:id', verifyAuth, deleteSavedSearch);

export default router;
