import mongoose from 'mongoose';
import Loan from "../models/Loan.js";
import HttpService from './httpService.js';

// Format loan response data
const formatLoanResponse = (loan, isReturned = false) => {
  const response = {
    id: loan._id,
    user_id: loan.user_id,
    book_id: loan.book_id,
    issue_date: loan.issue_date,
    due_date: loan.due_date
  };

  if (isReturned) {
    response.return_date = loan.return_date;
  }

  response.status = loan.status;
  return response;
};

//  Format user loan with book details
const formatUserLoanWithBook = (loan, book) => {
  return {
    id: loan._id,
    book: {
      id: book?.id || loan.book_id,
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
const formatLoanWithDetails = (loan, user, book) => {
  return {
    id: loan._id,
    user: user ? {
      id: user._id,
      name: user.name,
      email: user.email
    } : null,
    book: book ? {
      id: book.id,
      title: book.title,
      author: book.author
    } : null,
    issue_date: loan.issue_date,
    due_date: loan.due_date,
    return_date: loan.return_date || null,
    status: loan.status,
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
    const { user_id, book_id, due_date } = loanData;

    // Validate user
    await HttpService.getUser(user_id);

    // Validate book and check availability
    const book = await HttpService.getBook(book_id);
    if (!book.available_copies || book.available_copies <= 0) {
      throw new Error('Book is not available for loan');
    }

    // Create loan record
    const loan = new Loan({
      user_id,
      book_id,
      due_date: new Date(due_date)
    });

    await loan.save();

    try {
      // Update book availability
      await HttpService.updateBookAvailability(book_id, 'decrement');
      return {
        data: formatLoanResponse(loan),
      };
    } catch (error) {
      // If book availability update fails, delete the loan record
      await Loan.findByIdAndDelete(loan._id);
      throw error;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

export const returnLoan = async (loanId) => {
  try {
    const loan = await findLoanById(loanId);
    if (!loan) {
      throw new Error('Loan not found');
    }

    if (loan.status === 'RETURNED') {
      throw new Error('Book already returned');
    }

    loan.status = 'RETURNED';
    loan.return_date = new Date();
    await loan.save();

    try {
      await HttpService.updateBookAvailability(loan.book_id, 'increment');
      return {
        data: formatLoanResponse(loan, true),
      };
    } catch (error) {
      loan.status = 'ACTIVE';
      loan.return_date = undefined;
      await loan.save();
      throw error;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getUserLoans = async (userId) => {
  try {
    await HttpService.getUser(userId);

    const loans = await Loan.find({ user_id: userId });
    const loansWithDetails = await Promise.all(
      loans.map(async (loan) => {
        const book = await HttpService.getBook(loan.book_id);
        return formatUserLoanWithBook(loan, book);
      })
    );

    return {
      loans: loansWithDetails,
      total: loansWithDetails.length
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getLoanDetails = async (loanId) => {
  try {
    const loan = await findLoanById(loanId);
    if (!loan) {
      throw new Error('Loan not found');
    }

    const [user, book] = await Promise.all([
      HttpService.getUser(loan.user_id),
      HttpService.getBook(loan.book_id)
    ]);

    return {
      data: formatLoanWithDetails(loan, user, book),
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

