import express from 'express';
import LoanController from '../controllers/loanController.js';

const router = express.Router();

// Issue a book
router.post('/', LoanController.issueBook);

// Return a book
router.post('/returns', LoanController.returnBook);

// Get user's loan history
router.get('/user/:user_id', LoanController.getUserLoans);

// Get specific loan details
router.get('/:id', LoanController.getLoanDetails);

export default router;
