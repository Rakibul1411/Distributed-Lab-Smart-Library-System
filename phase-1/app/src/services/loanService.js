import Loan from "../models/Loan.js";
import { bookServiceExternal, userServiceExternal } from "./index.js";
import mongoose from 'mongoose';

// Format loan response data
const formatLoanResponse = (loan) => {
  return {
    id: loan._id,
    user_id: loan.user,
    book_id: loan.book,
    issue_date: loan.issue_date,
    due_date: loan.due_date,
    status: loan.status
  };
};

//  Format loan with book details
const formatLoanWithBook = (loan, book) => {
  return {
    id: loan._id,
    book: {
      id: book?._id || loan.book,
      title: book?.title || "Unknown",
      author: book?.author || "Unknown"
    },
    issue_date: loan.issue_date,
    due_date: loan.due_date,
    return_date: loan.return_date || null,
    status: loan.status
  };
};

// Format overdue loan response
const formatOverdueLoan = (loan, user, book, daysOverdue) => {
  return {
    id: loan._id,
    user: user ? {
      id: user._id,
      name: user.name,
      email: user.email
    } : null,
    book: book ? {
      id: book._id,
      title: book.title,
      author: book.author
    } : null,
    issue_date: loan.issue_date,
    due_date: loan.due_date,
    days_overdue: daysOverdue
  };
};

// Format extended loan response
const formatExtendedLoan = (loan) => {
  return {
    id: loan._id,
    user_id: loan.user,
    book_id: loan.book,
    issue_date: loan.issue_date,
    original_due_date: loan.original_due_date,
    extended_due_date: loan.extended_due_date,
    status: loan.status,
    extensions_count: loan.extensions_count
  };
};


//  Format popular book response
const formatPopularBook = (book, borrow_count) => {
  return {
    book_id: book?._id || 'Unknown',
    title: book?.title || 'Unknown',
    author: book?.author || 'Unknown',
    borrow_count
  };
};

// Format active user response
const formatActiveUser = (user, books_borrowed, current_borrows) => {
  return {
    user_id: user?._id || 'Unknown',
    name: user?.name || 'Unknown',
    books_borrowed,
    current_borrows
  };
};

// Format system overview response
const formatSystemOverview = (
  books_stats,
  total_users,
  books_borrowed,
  overdue_loans,
  loans_today,
  returns_today
) => {
  return {
    total_books: books_stats.total_books,
    total_users,
    books_available: books_stats.books_available,
    books_borrowed,
    overdue_loans,
    loans_today,
    returns_today
  };
};

export const findLoanById = async (id) => {
  return await Loan.findById(id);
};

export const validateLoanIdInternal = (loan_id) => {
  return mongoose.Types.ObjectId.isValid(loan_id);
};

export const createLoan = async (loanData) => {
  try {
    if (!userServiceExternal.validateUserIdInternal(loanData.user_id) || 
        !bookServiceExternal.validateBookIdInternal(loanData.book_id)) {
      return { success: false, error: 'Invalid user or book ID' };
    }

    const user = await userServiceExternal.findUserById(loanData.user_id);
    if (!user) return { success: false, error: 'User not found' };

    const bookAvailability = await bookServiceExternal.getAvailableBooksCount(loanData.book_id);
    if (!bookAvailability.exists) return { success: false, error: 'Book not found' };
    if (!bookAvailability.canBorrow) return { success: false, error: 'No available copies' };

    const loan = await Loan.create({
      user: user._id,
      book: bookAvailability.book._id,
      due_date: loanData.due_date,
      original_due_date: loanData.due_date
    });

    await bookServiceExternal.updateAvailableCopies(loanData.book_id, -1);

    return {
      success: true,
      data: formatLoanResponse(loan)
    };
  } catch (error) {
    console.error("Error in createLoan:", error);
    return { success: false, error: error.message };
  }
};

export const returnLoan = async (loan_id) => {
  try {
    const loan = await findLoanById(loan_id);
    if (!loan) return { success: false, error: 'Loan not found' };
    if (loan.status === 'RETURNED') return { success: false, error: 'Already returned' };

    loan.return_date = new Date();
    loan.status = 'RETURNED';
    await loan.save();

    await bookServiceExternal.updateAvailableCopies(loan.book, 1);

    return {
      success: true,
      data: formatLoanResponse(loan)
    };
  } catch (error) {
    console.error("Error in returnLoan:", error);
    return { success: false, error: error.message };
  }
};

export const getUserLoans = async (user_id) => {
  try {
    const user = await userServiceExternal.findUserById(user_id);
    if (!user) return { success: false, error: 'User not found' };

    const loans = await Loan.find({ user: user_id }).sort('-issue_date');

    if (!loans.length) {
      return {
        success: true,
        data: []
      };
    }

    const loansWithBooks = await Promise.all(
      loans.map(async loan => {
        try {
          const book = await bookServiceExternal.findBookById(loan.book);
          return formatLoanWithBook(loan, book);
        } catch (err) {
          console.error(`Error fetching book for loan ${loan._id}:`, err);
          return formatLoanWithBook(loan, null);
        }
      })
    );

    return {
      success: true,
      data: loansWithBooks
    };
  } catch (error) {
    console.error("Error in getUserLoans:", error);
    return { success: false, error: error.message };
  }
};

export const getOverdueLoans = async () => {
  try {
    const today = new Date();
    
    const overdueLoans = await Loan.find({
      due_date: { $lt: today },
      status: 'ACTIVE'
    });

    const enrichedLoans = await Promise.all(
      overdueLoans.map(async loan => {
        const [user, book] = await Promise.all([
          userServiceExternal.findUserById(loan.user),
          bookServiceExternal.findBookById(loan.book)
        ]);

        const dueDate = new Date(loan.due_date);
        const diffTime = Math.abs(today - dueDate);
        const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return formatOverdueLoan(loan, user, book, daysOverdue);
      })
    );

    return {
      success: true,
      data: enrichedLoans
    };
  } catch (error) {
    console.error("Error in getOverdueLoans:", error);
    return { success: false, error: error.message };
  }
};

export const extendLoan = async (loan_id, extension_days) => {
  try {
    const loan = await findLoanById(loan_id);
    if (!loan) return { success: false, error: 'Loan not found' };
    if (loan.status !== 'ACTIVE') return { success: false, error: 'Only active loans can be extended' };

    if (loan.extensions_count === 0) {
      loan.original_due_date = loan.due_date;
    }

    const newDueDate = new Date(loan.due_date);
    newDueDate.setDate(newDueDate.getDate() + extension_days);

    loan.due_date = newDueDate;
    loan.extended_due_date = newDueDate;
    loan.extensions_count += 1;
    await loan.save();

    return {
      success: true,
      data: formatExtendedLoan(loan)
    };
  } catch (error) {
    console.error("Error in extendLoan:", error);
    return { success: false, error: error.message };
  }
};

export const getPopularBooks = async () => {
  try {
    const popularBooks = await Loan.aggregate([
      {
        $group: {
          _id: '$book',
          borrow_count: { $sum: 1 }
        }
      },
      { $sort: { borrow_count: -1 } },
      { $limit: 12 }
    ]);

    if (!popularBooks.length) {
      return {
        success: true,
        data: []
      };
    }

    const booksWithDetails = await Promise.all(
      popularBooks.map(async ({ _id: book_id, borrow_count }) => {
        const book = await bookServiceExternal.findBookById(book_id);
        return formatPopularBook(book, borrow_count);
      })
    );

    return {
      success: true,
      data: booksWithDetails
    };
  } catch (error) {
    console.error("Error in getPopularBooks:", error);
    return { success: false, error: error.message };
  }
};

export const getActiveUsers = async () => {
  try {
    const activeUsers = await Loan.aggregate([
      {
        $group: {
          _id: '$user',
          books_borrowed: { $sum: 1 },
          current_borrows: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] 
            } 
          }
        }
      },
      { $sort: { books_borrowed: -1 } },
      { $limit: 12 }
    ]);

    if (!activeUsers.length) {
      return {
        success: true,
        data: []
      };
    }

    const usersWithDetails = await Promise.all(
      activeUsers.map(async ({ _id: user_id, books_borrowed, current_borrows }) => {
        const user = await userServiceExternal.findUserById(user_id);
        return formatActiveUser(user, books_borrowed, current_borrows);
      })
    );

    return {
      success: true,
      data: usersWithDetails
    };
  } catch (error) {
    console.error("Error in getActiveUsers:", error);
    return { success: false, error: error.message };
  }
};

export const getSystemOverview = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const books_stats = await bookServiceExternal.getBookStatistics();
    const total_users = await userServiceExternal.countTotalUsers();

    const [books_borrowed, overdue_loans, loans_today, returns_today] = await Promise.all([
      
      Loan.countDocuments(),

      Loan.countDocuments({ 
        due_date: { $lt: new Date() }, 
        status: 'ACTIVE' 
      }),

      Loan.countDocuments({ 
        issue_date: { $gte: today, $lt: tomorrow } 
      }),

      Loan.countDocuments({ 
        return_date: { $gte: today, $lt: tomorrow } 
      })

    ]);

    return {
      success: true,
      data: formatSystemOverview(
        books_stats,
        total_users,
        books_borrowed,
        overdue_loans,
        loans_today,
        returns_today
      )
    };
  } catch (error) {
    console.error("Error in getSystemOverview:", error);
    return { success: false, error: error.message };
  }
};

