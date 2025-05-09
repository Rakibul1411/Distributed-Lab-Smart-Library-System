import Loan from "../models/Loan.js";
import { bookServiceExternal, userServiceExternal } from "./index.js";
import mongoose from 'mongoose';

export const findLoanById = async (id) => {
  return await Loan.findById(id);
};

export const validateLoanIdInternal = (loan_id) => {
  return mongoose.Types.ObjectId.isValid(loan_id);
};

export const createLoan = async (loanData) => {
  if (!userServiceExternal.validateUserIdInternal(loanData.user_id) || !bookServiceExternal.validateBookIdInternal(loanData.book_id)) {
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
    data: loan
  };
};


export const returnLoan = async (loan_id) => {
  const loan = await findLoanById(loan_id);
  if (!loan) return { success: false, error: 'Loan not found' };
  if (loan.status === 'RETURNED') return { success: false, error: 'Already returned' };

  loan.return_date = new Date();
  loan.status = 'RETURNED';
  await loan.save();

  await bookServiceExternal.updateAvailableCopies(loan.book_id, 1);

  return {
    success: true,
    data: loan
  };
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
          if (!book) {
            return {
              ...loan.toObject(),
              book: {
                id: loan.book,
                title: "Book not found",
                author: "Unknown"
              }
            };
          }
          return {
            ...loan.toObject(),
            book: {
              id: book._id,
              title: book.title,
              author: book.author
            }
          };
        } catch (err) {
          console.error(`Error fetching book for loan ${loan._id}:`, err);
          return {
            ...loan.toObject(),
            book: {
              id: loan.book,
              title: "Error fetching book",
              author: "Unknown"
            }
          };
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

    console.log(overdueLoans);
    const enrichedLoans = await Promise.all(
      overdueLoans.map(async loan => {
        const [user, book] = await Promise.all([
          userServiceExternal.findUserById(loan.user),
          bookServiceExternal.findBookById(loan.book)
        ]);

        console.log(user, book);

        const dueDate = new Date(loan.due_date);
        const diffTime = Math.abs(today - dueDate);
        const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        console.log(user, book);

        return {
          ...loan.toObject(),
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
          days_overdue: daysOverdue
        };
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

    // Update loan details
    loan.due_date = newDueDate;
    loan.extended_due_date = newDueDate;
    loan.extensions_count += 1;
    await loan.save();

    return {
      success: true,
      data: {
        id: loan._id,
        user_id: loan.user,
        book_id: loan.book,
        issue_date: loan.issue_date,
        original_due_date: loan.original_due_date,
        extended_due_date: loan.extended_due_date,
        status: loan.status,
        extensions_count: loan.extensions_count
      }
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
        return {
          book_id: book_id,
          title: book?.title || 'Unknown',
          author: book?.author || 'Unknown',
          borrow_count
        };
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

    // Get user details for each active user
    const usersWithDetails = await Promise.all(
      activeUsers.map(async ({ _id: user_id, books_borrowed, current_borrows }) => {
        const user = await userServiceExternal.findUserById(user_id);
        return {
          user_id,
          name: user?.name || 'Unknown',
          books_borrowed,
          current_borrows
        };
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

    const [active_loans, overdue_loans, loans_today, returns_today] = await Promise.all([
      Loan.countDocuments({ status: 'ACTIVE' }),
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
      data: {
        total_books: books_stats.total_books,
        total_users: total_users,
        books_available: books_stats.books_available,
        books_borrowed: active_loans,
        overdue_loans: overdue_loans,
        loans_today: loans_today,
        returns_today: returns_today
      }
    };
  } catch (error) {
    console.error("Error in getSystemOverview:", error);
    return { success: false, error: error.message };
  }
};

