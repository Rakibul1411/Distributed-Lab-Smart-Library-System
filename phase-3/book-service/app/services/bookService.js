import mongoose from 'mongoose';
import Book from "../models/Book.js";


export const validateBookIdInternal = (book_id) => {
  return mongoose.Types.ObjectId.isValid(book_id);
};

export const findBookByISBN = async (isbn) => {
  return await Book.findOne({ isbn });
};


export const findBookById = async (id) => {
  return await Book.findById(id);
};


export const countBooks = async () => {
  return await Book.countDocuments();
};


export const getAvailableBooksCount = async (id) => {
  const book = await findBookById(id);
  if (!book) {
    return { 
      exists: false, 
      available: false, 
      book: null 
    };
  }
  
  return {
    exists: true,
    canBorrow: book.available_copies > 0,
    book
  };
};


export const updateAvailableCopies = async (book_id, returnBookCount) => {
  const book = await findBookById(book_id);
  if (!book) return null;
  
  book.available_copies += returnBookCount;
  return await book.save();
};


export const createBook = async (bookData) => {
  const existingBook = await findBookByISBN(bookData.isbn);
  if (existingBook) {
    return null;
  }

  const book = new Book({
    title: bookData.title,
    author: bookData.author,
    isbn: bookData.isbn,
    copies: bookData.copies,
    available_copies: bookData.copies,
  });

  const savedBook = await book.save();
  
  return {
    id: savedBook._id,
    title: savedBook.title,
    author: savedBook.author,
    isbn: savedBook.isbn,
    copies: savedBook.copies,
    available_copies: savedBook.available_copies,
    created_at: savedBook.createdAt
  };
};


export const searchBooks = async (searchTerm, page = 1, perPage = 10) => {
  const query = searchTerm 
    ? {
        $or: [
          { title: { $regex: `\\b${searchTerm}\\b`, $options: 'i' } },
          { author: { $regex: `\\b${searchTerm}\\b`, $options: 'i' } }
        ]
      }
    : {};
  
  const skip = (page - 1) * perPage;
  
  const [books, total] = await Promise.all([
    Book.find(query)
      .skip(skip)
      .limit(perPage),
    Book.countDocuments(query)
  ]);

  return {
    books: books.map(book => ({
      id: book._id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      copies: book.copies,
      available_copies: book.available_copies
    })),
    total,
    page: parseInt(page),
    per_page: parseInt(perPage)
  };
};


export const updateBookById = async (id, bookData) => {
  if (bookData.isbn) {
    const existingBook = await findBookByISBN(bookData.isbn);
    
    if (existingBook && existingBook._id.toString() !== id) {
      return null;
    }
  }

  if (bookData.available_copies !== undefined || bookData.copies !== undefined) {
    const currentBook = await findBookById(id);
    
    if (bookData.copies !== undefined) {
      if (bookData.available_copies === undefined) {
        const loanedCopies = currentBook.copies - currentBook.available_copies;
        bookData.available_copies = Math.max(0, bookData.copies - loanedCopies);
      } else if (bookData.available_copies > bookData.copies) {
        return null;
      }
    }

    else if (bookData.available_copies > currentBook.copies) {
      return null;
    }
  }

  const updateData = {
    ...bookData,
    updatedAt: Date.now()
  };

  const updateOptions = {
    new: true,     
    runValidators: true 
  };

  return await Book.findByIdAndUpdate(
    id,
    updateData,
    updateOptions
  );
};


export const updateBookAvailability = async (id, bookData) => { 
  const book = await findBookById(id);
  if (!book) return null;

  const { available_copies, operation } = bookData;
  
  if (operation === 'increment') {
    book.available_copies = Math.min(book.copies, book.available_copies + available_copies);
  } else if (operation === 'decrement') {
    book.available_copies = Math.max(0, book.available_copies - available_copies);
  } else if (operation === 'set') {
    book.available_copies = Math.min(book.copies, Math.max(0, available_copies));
  } else {
    return null; // Invalid operation
  }

  const updatedBook = await book.save();
  return {
    id: updatedBook._id,
    available_copies: updatedBook.available_copies,
    updated_at: updatedBook.updatedAt
  };
};


export const deleteBookById = async (id) => {
  const book = await findBookById(id);

  if (!book) {
    return null;
  }
  
  // await Loan.deleteMany({ book: id });
  await Book.deleteOne({ _id: id });

  return book;
};

export const getBookStatistics = async () => {
  try {
    const [totalBooks, availableBooks] = await Promise.all([
      Book.aggregate([
        { $group: { _id: null, total: { $sum: '$copies' } } }
      ]),
      Book.aggregate([
        { $group: { _id: null, total: { $sum: '$available_copies' } } }
      ])
    ]);

    return {
      total_books: totalBooks[0]?.total || 0,
      books_available: availableBooks[0]?.total || 0
    };
  } catch (error) {
    console.error("Error in getBookStatistics:", error);
    return { total_books: 0, books_available: 0 };
  }
};