import express from 'express';

import userRoutes from './userRoutes.js';
import bookRoutes from './bookRoutes.js';
import loanRoutes from './loanRoutes.js';
import statsRoutes from './statsRoutes.js';

const router = express.Router();

router.use('/api/users', userRoutes);
router.use('/api/books', bookRoutes);
router.use('/api/loans', loanRoutes);
router.use('/api/stats', statsRoutes);


export default router;