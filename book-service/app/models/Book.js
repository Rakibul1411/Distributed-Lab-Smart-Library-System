import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
  },
  copies: {
    type: Number,
    required: true,
    min: 0,
  },
  available_copies: {
    type: Number,
    required: true,
    min: 0,
  },
},
  {
    timestamps: true,
  }
);

const Book = mongoose.model('Book', BookSchema);
export default Book;