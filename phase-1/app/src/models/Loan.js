import mongoose from 'mongoose';

const LoanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  issue_date: {
    type: Date,
    default: Date.now,
  },
  due_date: {
    type: Date,
    required: true,
  },
  return_date: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'RETURNED'],
    default: 'ACTIVE',
  },
  original_due_date: {
    type: Date,
  },
  extended_due_date: {
    type: Date,
  },
  extensions_count: {
    type: Number,
    default: 0,
  },
});

const Loan = mongoose.model('Loan', LoanSchema);
export default Loan;