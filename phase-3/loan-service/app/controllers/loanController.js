import { loanService } from '../services/index.js';

class LoanController {
  static async issueBook(req, res, next) {
    try {
      const result = await loanService.createLoan(req.body);
      res.status(201).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async returnBook(req, res, next) {
    try {
      const { loan_id } = req.body;
      const result = await loanService.returnLoan(loan_id);
      res.json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async getUserLoans(req, res, next) {
    try {
      const { user_id } = req.params;
      const result = await loanService.getUserLoans(user_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getLoanDetails(req, res, next) {
    try {
      const { id } = req.params;
      const result = await loanService.getLoanDetails(id);
      res.json(result.data);
    } catch (error) {
      next(error);
    }
  }
}

export default LoanController;
