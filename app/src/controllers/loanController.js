import { loanService } from '../services/index.js';

// Issue a book to a user
export const issueBook = async (req, res, next) => {
  try {
    const loan = await loanService.createLoan(req.body);

    if (!loan.success) {
      const statusCode = 
        loan.error === 'User not found' || loan.error === 'Book not found' ? 404 :
        loan.error === 'No available copies' ? 400 :
        500;
      
      return res.status(statusCode).json({ 
        success: false, 
        error: loan.error 
      });
    }

    const responseData = {
      id: loan.data._id,
      user_id: loan.data.user,
      book_id: loan.data.book,
      issue_date: loan.data.issue_date,
      due_date: loan.data.due_date,
      status: loan.data.status
    };

    res.status(201).json(responseData);
  } catch (err) {
    next(err);
  }
};

// Return a book
export const returnBook = async (req, res, next) => {
  try {
    const loan = await loanService.returnLoan(req.body.loan_id);
    
    if (!loan.success) {
      return res.status(loan.error === 'Loan not found' 
        ? 404 
        : 400
      ).json({ success: false, error: loan.error });
    }

    const responseData = {
      id: loan.data._id,
      user_id: loan.data.user,
      book_id: loan.data.book,
      issue_date: loan.data.issue_date,
      due_date: loan.data.due_date,
      return_date: loan.data.return_date,
      status: loan.data.status,
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

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const serviceResult = await loanService.getUserLoans(user_id);
    
    if (!serviceResult.success) {
      return res.status(404).json({ 
        success: false, 
        error: serviceResult.error 
      });
    }

    const loanHistory = serviceResult.data.map(loan => ({
      id: loan._id,
      book: {
        id: loan.book.id,
        title: loan.book.title,
        author: loan.book.author
      },
      issue_date: loan.issue_date,
      due_date: loan.due_date,
      return_date: loan.return_date || null,
      status: loan.status
    }));

    return res.status(200).json(loanHistory);

  } catch (err) {
    next(err);
  }
};

// Get overdue loans
export const getOverdueLoans = async (req, res, next) => {
  try {
    const result = await loanService.getOverdueLoans();
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    const overdueLoans = result.data.map(loan => ({
      id: loan._id,
      user: loan.user,
      book: loan.book,
      issue_date: loan.issue_date,
      due_date: loan.due_date,
      days_overdue: loan.days_overdue
    }));

    return res.status(200).json(overdueLoans);
  } catch (err) {
    next(err);
  }
};

// Extend loan due date
export const extendLoan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { extension_days } = req.body;

    if (!extension_days || extension_days <= 0) {
      return res.status(400).json({
        error: 'Valid extension days are required'
      });
    }

    const result = await loanService.extendLoan(id, extension_days);
    
    if (!result.success) {
      const statusCode = result.error === 'Loan not found' ? 404 : 400;
      return res.status(statusCode).json({
        error: result.error
      });
    }

    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};


// Get most borrowed books
export const getPopularBooks = async (req, res, next) => {
  try {
    const result = await loanService.getPopularBooks();
    
    if (!result.success) {
      return res.status(500).json({
        error: result.error
      });
    }

    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};


// Get most active users
export const getActiveUsers = async (req, res, next) => {
  try {
    const result = await loanService.getActiveUsers();
    
    if (!result.success) {
      return res.status(500).json({
        error: result.error
      });
    }

    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};


// Get system overview statistics
export const getSystemOverview = async (req, res, next) => {
  try {
    const result = await loanService.getSystemOverview();
    
    if (!result.success) {
      return res.status(500).json({
        error: result.error
      });
    }

    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};
