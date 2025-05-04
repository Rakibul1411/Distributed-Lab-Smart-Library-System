import Book from '../models/Book.js';
import Loan from '../models/Loan.js';

// Add a new book
export const addBook = async (req, res, next) => {
  try {
    const { title, author, isbn, copies } = req.body;

    const book = new Book({
      title,
      author,
      isbn,
      copies,
      available_copies: copies,
    });

    await book.save();

    res.status(201).json({
      success: true,
      data: book,
    });
  } catch (err) {
    next(err);
  }
};

// Get all books by title, author, or keyword.
export const getBooks = async (req, res, next) => {
  try {
    const { search } = req.query; // use query for filtering based search term
    let query = {};

    if (search) {
      query = {
        $or: [
          { title: { $regex: `\\b${search}\\b`, $options: 'i' } },
          { author: { $regex: `\\b${search}\\b`, $options: 'i' } }
        ]
      };
    }

    const books = await Book.find(query);

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (err) {
    next(err);
  }
};

// Get book by ID
export const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found',
      });
    }

    const response = {
      id:               book._id,
      title:            book.title,
      author:           book.author,
      isbn:             book.isbn,
      copies:           book.copies,
      available_copies: book.available_copies,
      created_at:       book.createdAt.toISOString(),
      updated_at:       book.updatedAt.toISOString()
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};


// Update book
export const updateBook = async (req, res, next) => {
  try {
    const { title, author, isbn, copies, available_copies } = req.body;

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title,
        author,
        isbn,
        copies,
        available_copies,
        updatedAt: Date.now(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).select('-__v');

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found',
      });
    }

    const response = {
      id:               book._id,
      title:            book.title,
      author:           book.author,
      isbn:             book.isbn,
      copies:           book.copies,
      available_copies: book.available_copies,
      created_at:       book.createdAt.toISOString(),
      updated_at:       book.updatedAt.toISOString()
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

// Delete book
export const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found',
      });
    }

    // Also delete any loans associated with this book
    await Loan.deleteMany({ book: req.params.id });

    res.status(204).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};