// controllers/loanController.js
import Loan  from '../models/Loan.js';
import Book  from '../models/Book.js';
import User  from '../models/User.js';

// Issue a book to a user
export const issueBook = async (req, res, next) => {
  try {
    const { user_id, book_id, due_date } = req.body;

    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const book = await Book.findById(book_id);

    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    if (book.available_copies < 1) {
      return res.status(400).json({ success: false, error: 'No available copies' });
    }

    const loan = new Loan({
      user_id,
      book_id,
      due_date,
      original_due_date: due_date,
    });

    await loan.save();

    book.available_copies -= 1;
    await book.save();

    const responseData = {
      id: loan._id,
      user_id: loan.user_id,
      book_id: loan.book_id,
      issue_date: loan.issue_date,
      due_date: loan.due_date,
      status: loan.status,
    };

    res.status(201).json(responseData);
  } catch (err) {
    next(err);
  }
};

// Return a book
export const returnBook = async (req, res, next) => {
  try {
    const { loan_id } = req.body;

    const loan = await Loan
      .findById(loan_id)
      .populate('book_id', 'available_copies');

    if (!loan) {
      return res.status(404).json({ success: false, error: 'Loan not found' });
    }

    if (loan.status === 'RETURNED') {
      return res.status(400).json({ success: false, error: 'Already returned' });
    }

    loan.return_date = new Date();
    loan.status      = 'RETURNED';
    await loan.save();

    const book = await Book.findById(loan.book_id._id);
    book.available_copies += 1;
    await book.save();

    const responseData = {
      id: loan._id,
      user_id: loan.user_id,
      book_id: loan.book_id._id,
      issue_date: loan.issue_date,
      due_date: loan.due_date,
      return_date: loan.return_date,
      status: loan.status,
    };

    res.status(200).json(responseData);
  } catch (err) {
    next(err);
  }
};

// Get loan history for a user
export const getUserLoans = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    
    const loans = await Loan
      .find({ user_id })
      .populate('book_id', 'title author')
      .sort('-issue_date');

    const loanHistory = loans.map(loan => ({
      id: loan._id,
      book_id: {
        id: loan.book_id._id,
        title: loan.book_id.title,
        author: loan.book_id.author,
      },
      issue_date: loan.issue_date,
      due_date: loan.due_date,
      return_date: loan.return_date || null,
      status: loan.status,
    }))  

    res.status(200).json(loanHistory);
  } catch (err) {
    next(err);
  }
};

// List all overdue loans for the module
export const getOverdueLoans = async (req, res, next) => {
  try {
    const now = new Date();
    const overdue = await Loan
      .find({ due_date: { $lt: now }, status: 'ACTIVE' })
      .populate('user_id', 'name email')
      .populate('book_id', 'title author');

    const result = overdue.map(loan => ({
      id: loan._id,
      user: {
        id:    loan.user_id._id,
        name:  loan.user_id.name,
        email: loan.user_id.email
      },
      book: {
        id:     loan.book_id._id,
        title:  loan.book_id.title,
        author: loan.book_id.author
      },
      issue_date:  loan.issue_date,
      due_date:    loan.due_date,
      days_overdue: Math.floor((now - loan.due_date) / 86400000)
    }));

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// Extend loan due date
export const extendLoan = async (req, res, next) => {
  try {
    const { extension_days } = req.body;
    const { id } = req.params;
    const loan = await Loan.findById(id);

    if (!loan) return res.status(404).json({ success: false, error: 'Loan not found' });
    if (loan.status !== 'ACTIVE') return res.status(400).json({ success: false, error: 'Only active loans can be extended' });

    if (loan.extensions_count === 0) loan.original_due_date = loan.due_date;

    const newDue = new Date(loan.due_date);
    newDue.setDate(newDue.getDate() + parseInt(extension_days, 10));

    loan.due_date          = newDue;
    loan.extended_due_date = newDue;
    loan.extensions_count += 1;
    await loan.save();

    const responseData = {
      id:                  loan._id,
      user_id:             loan.user_id,
      book_id:             loan.book_id,
      issue_date:          loan.issue_date,
      original_due_date:   loan.original_due_date,
      extended_due_date:   loan.extended_due_date,
      status:              loan.status,
      extensions_count:    loan.extensions_count
    };

    res.status(200).json(responseData);
  } catch (err) {
    next(err);
  }
};