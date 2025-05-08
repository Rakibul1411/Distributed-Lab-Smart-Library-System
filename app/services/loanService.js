import Loan from '../models/Loan.js';

export const createLoan = async (loanData) => {
  const loan = new Loan({
    user_id: loanData.user_id,
    book_id: loanData.book_id,
    due_date: loanData.due_date,
    original_due_date: loanData.due_date,
  });

  return await loan.save();
};


export const findLoanById = async (id) => {
  return await Loan.findById(id);
};


export const findByIdWithBook = async (id) => {
  return await Loan.findLoanById(id).populate('book_id', 'available_copies');
};


export const updateLoan = async (loan) => {
  return await loan.save();
};


export const deleteByBookId = async (bookId) => {
  return await Loan.deleteMany({ book_id: bookId });
};


export const getUserLoanHistory = async (userId) => {
  return await Loan
    .find({ user_id: userId })
    .populate('book_id', 'title author')
    .sort('-issue_date');
};


export const getOverdueLoans = async () => {
  const now = new Date();
  return await Loan
    .find({ due_date: { $lt: now }, status: 'ACTIVE' })
    .populate('user_id', 'name email')
    .populate('book_id', 'title author');
};


export const extendLoan = async (id, days) => {
  const loan = await Loan.findById(id);
  
  if (!loan || loan.status !== 'ACTIVE') return null;

  if (loan.extensions_count === 0) {
    loan.original_due_date = loan.due_date;
  }

  const newDue = new Date(loan.due_date);
  newDue.setDate(newDue.getDate() + parseInt(days, 10));

  loan.due_date = newDue;
  loan.extended_due_date = newDue;
  loan.extensions_count += 1;
  
  return await loan.save();
};


export const getPopularBooks = async (limit = 9) => {
  return await Loan.aggregate([
    {
      $group: {
        _id: '$book_id',
        borrow_count: { $sum: 1 }
      }
    },
    { $sort: { borrow_count: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: '_id',
        as: 'book'
      }
    },
    { $unwind: '$book' },
    {
      $project: {
        book_id: '$_id',
        title: '$book.title',
        author: '$book.author',
        borrow_count: 1,
        _id: 0
      }
    }
  ]);
};


export const getActiveUsers = async (limit = 9) => {
  return await Loan.aggregate([
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
    { $limit: limit },
    { 
      $lookup: { 
        from: 'users', 
        localField: '_id', 
        foreignField: '_id', 
        as: 'user' 
      } 
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
};


export const countActiveLoans = async () => {
  return await Loan.countDocuments({ status: 'ACTIVE' });
};


export const countOverdueLoans = async () => {
  return await Loan.countDocuments({ 
    due_date: { $lt: new Date() }, 
    status: 'ACTIVE' 
  });
};


export const countLoansToday = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return await Loan.countDocuments({ 
    issue_date: { $gte: today, $lt: tomorrow } 
  });
};


export const countReturnsToday = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return await Loan.countDocuments({ 
    return_date: { $gte: today, $lt: tomorrow } 
  });
};