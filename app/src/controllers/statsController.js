// controllers/statsController.js
import Book from '../models/Book.js';
import Loan from '../models/Loan.js';
import User from '../models/User.js';

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
