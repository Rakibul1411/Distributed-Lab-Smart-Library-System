import express from 'express';
import loanRoutes from './loanRoutes.js';


const router = express.Router();

router.use('/api/loans', loanRoutes);

export default router;