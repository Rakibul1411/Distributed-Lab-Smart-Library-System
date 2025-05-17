import { loanService } from '../services/index.js';

class LoanController {
  static async issueBook(req, res) {
    try {
      const result = await loanService.createLoan(req.body);
      res.status(201).json(result.data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async returnBook(req, res) {
    try {
      const { loan_id } = req.body;
      const result = await loanService.returnLoan(loan_id);
      res.json(result.data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getUserLoans(req, res) {
    try {
      const { user_id } = req.params;
      const result = await loanService.getUserLoans(user_id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getLoanDetails(req, res) {
    try {
      const { id } = req.params;
      const result = await loanService.getLoanDetails(id);
      res.json(result.data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default LoanController;
