import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  book_id: {
    type: String,
    required: true
  },
  issue_date: {
    type: Date,
    default: Date.now
  },
  due_date: {
    type: Date,
    required: true
  },
  return_date: {
    type: Date
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'RETURNED', 'OVERDUE'],
    default: 'ACTIVE'
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
}, {
  timestamps: true
});

const Loan = mongoose.model('Loan', loanSchema);

export default Loan;