import express from 'express';

import bookRoutes from './bookRoutes.js';


const router = express.Router();

router.use('/api/books', bookRoutes);

export default router;