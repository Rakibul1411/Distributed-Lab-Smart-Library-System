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


// Get most borrowed books
export const getPopularBooks = async (req, res, next) => {
  try {
    const popularBooks = await Loan.aggregate([
      {
        $group: {
          _id: '$book_id',
          borrow_count: { $sum: 1 }
        }
      },
      { $sort: { borrow_count: -1 } },
      { $limit: 9 },
      {
        $lookup: { // Join with the books collection
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book'
        }
      },
      { $unwind: '$book' },
      {
        $project: {
          book_id:     '$_id',
          title:       '$book.title',
          author:      '$book.author',
          borrow_count: 1,
          _id:         0
        }
      }
    ]);

    const formatted = popularBooks.map(({ book_id, title, author, borrow_count }) => ({
      book_id,
      title,
      author,
      borrow_count
    }));

    res.status(200).json(formatted);
  } catch (err) {
    next(err);
  }
};


// Get most active users
export const getActiveUsers = async (req, res, next) => {
  try {
    const activeUsers = await Loan.aggregate([
      {
        $group: {
          _id: '$user_id',
          books_borrowed: { $sum: 1 },
          current_borrows: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] 
            } 
          }
        }
      },
      { $sort: { books_borrowed: -1 } },
      { $limit: 9 },
      { $lookup: { 
        from: 'users', 
        localField: '_id', 
        foreignField: '_id', 
        as: 'user' } 
      },
      { $unwind: '$user' },
      {
        $project: {
          user_id: '$_id',
          name: '$user.name',
          books_borrowed: 1,
          current_borrows: 1,
          _id: 0
        }
      }
    ]);

    const formatted = activeUsers.map(({ user_id, name, books_borrowed, current_borrows }) => ({
      user_id,
      name,
      books_borrowed,
      current_borrows
    }));

    res.status(200).json(formatted);
  } catch (err) {
    next(err);
  }
};


// Get system overview statistics
export const getSystemOverview = async (req, res, next) => {
  try {
    // Total books = sum of copies across all books
    const totalBooksAgg = await Book.aggregate([
      { $group: { _id: null, total: { $sum: '$copies' } } }
    ]);

    const total_books = totalBooksAgg[0]?.total || 0;

    const total_users = await User.countDocuments();

    const booksAvailableAgg = await Book.aggregate([
      { $group: { _id: null, total: { $sum: '$available_copies' } } }
    ]);
    const books_available = booksAvailableAgg[0]?.total || 0;

    const books_borrowed = await Loan.countDocuments({ status: 'ACTIVE' });

    const overdue_loans = await Loan.countDocuments({ due_date: { $lt: new Date() }, status: 'ACTIVE' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const loans_today = await Loan.countDocuments({ issue_date: { $gte: today, $lt: tomorrow } });
    const returns_today = await Loan.countDocuments({ return_date: { $gte: today, $lt: tomorrow } });

    res.status(200).json({
      total_books,
      total_users,
      books_available,
      books_borrowed,
      overdue_loans,
      loans_today,
      returns_today
    });
  } catch (err) {
    next(err);
  }
};
