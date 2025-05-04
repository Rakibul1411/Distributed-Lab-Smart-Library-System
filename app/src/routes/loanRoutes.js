import express from 'express';
import {
  issueBook,
  returnBook,
  getUserLoans,
  getOverdueLoans,
  extendLoan,
} from '../controllers/loanController.js';

const router = express.Router();

router.post('/', issueBook);
router.post('/returns', returnBook);
router.get('/overdue', getOverdueLoans);
router.get('/:user_id', getUserLoans);
router.put('/:id/extend', extendLoan);

export default router;
