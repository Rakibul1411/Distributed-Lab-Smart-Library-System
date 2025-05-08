// services/index.js
import * as bookServiceInternal from './bookService.js';
import * as loanServiceInternal from './loanService.js';
import * as userServiceInternal from './userService.js';

// Export internal services (for use within their own controllers)
export const bookService = bookServiceInternal;
export const loanService = loanServiceInternal;
export const userService = userServiceInternal;

// Export external service methods (for use by other controllers)
export const bookServiceExternal = {
  findBookById: bookServiceInternal.findBookById,
  findAvailableCopiesById: bookServiceInternal.findAvailableCopiesById,
  updateAvailableCopies: bookServiceInternal.updateAvailableCopies,
  findAndPopulate: bookServiceInternal.findAndPopulate,
  getTotalBooks: bookServiceInternal.getTotalBooks,
  getAvailableBooksCount: bookServiceInternal.getAvailableBooksCount
};

export const loanServiceExternal = {
  getUserLoanHistory: loanServiceInternal.getUserLoanHistory,
  countActiveLoans: loanServiceInternal.countActiveLoans,
  countOverdueLoans: loanServiceInternal.countOverdueLoans,
  countLoansToday: loanServiceInternal.countLoansToday,
  countReturnsToday: loanServiceInternal.countReturnsToday,
  deleteByBookId: loanServiceInternal.deleteByBookId
};

export const userServiceExternal = {
  findUserById: userServiceInternal.findUserById,
};