import express from 'express';
import {
  addBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  updateBookAvailability,
} from '../controllers/bookController.js';

const router = express.Router();

router.post('/', addBook);
router.get('/', getBooks);
router.get('/:id', getBookById);
router.put('/:id', updateBook);
router.patch('/:id/availability', updateBookAvailability);
router.delete('/:id', deleteBook);

export default router;