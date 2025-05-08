import express from 'express';
import {
  issueBook,
  returnBook,
  getUserLoans,
  getOverdueLoans,
  extendLoan,
  getPopularBooks,
  getActiveUsers,
  getSystemOverview,
} from '../controllers/loanController.js';

const router = express.Router();

router.post('/', issueBook);
router.post('/returns', returnBook);
router.get('/overdue', getOverdueLoans);

router.get('/books/popular', getPopularBooks);
router.get('/users/active', getActiveUsers);
router.get('/overview', getSystemOverview);

router.get('/:user_id', getUserLoans);
router.put('/:id/extend', extendLoan);

export default router;
