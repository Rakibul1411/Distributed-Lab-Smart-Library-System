import * as userServiceInternal from './userService.js';
import * as bookServiceInternal from './bookService.js';
import * as loanServiceInternal from './loanService.js';

export const userService = userServiceInternal;
export const bookService = bookServiceInternal;
export const loanService = loanServiceInternal;


export const userServiceExternal = {
  findUserById: userServiceInternal.findUserById,
  countTotalUsers: userServiceInternal.countTotalUsers,
  validateUserIdInternal: userServiceInternal.validateUserIdInternal,
};


export const bookServiceExternal = {
  findBookById: bookServiceInternal.findBookById,
  updateAvailableCopies: bookServiceInternal.updateAvailableCopies,
  getAvailableBooksCount: bookServiceInternal.getAvailableBooksCount,
  validateBookIdInternal: bookServiceInternal.validateBookIdInternal,
  getBookStatistics: bookServiceInternal.getBookStatistics,
};