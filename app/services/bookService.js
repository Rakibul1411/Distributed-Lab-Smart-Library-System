import Book from '../models/Book.js';

export const createBook = async (bookData) => {
  const book = new Book({
    title: bookData.title,
    author: bookData.author,
    isbn: bookData.isbn,
    copies: bookData.copies,
    available_copies: bookData.copies,
  });

  return await book.save();
};


export const searchBooks = async (search) => {
  let query = {};

  if (search) {
    query = {
      $or: [
        { title: { $regex: `\\b${search}\\b`, $options: 'i' } },
        { author: { $regex: `\\b${search}\\b`, $options: 'i' } }
      ]
    };
  }

  return await Book.find(query);
};


export const findBookById = async (id) => {
  return await Book.findById(id);
};


export const updateBookById = async (id, bookData) => {
  return await Book.findByIdAndUpdate(
    id,
    {
      ...bookData,
      updatedAt: Date.now(),
    },
    {
      new: true,
      runValidators: true,
    }
  ).select('-__v');
};


export const removeBookById = async (id) => {
  return await Book.findByIdAndDelete(id);
};


export const updateAvailableCopies = async (id, change) => {
  const book = await Book.findById(id);
  if (!book) return null;
  
  book.available_copies += change;
  return await book.save();
};


export const getTotalBooks = async () => {
  const result = await Book.aggregate([
    { $group: { _id: null, total: { $sum: '$copies' } } }
  ]);
  return result[0]?.total || 0;
};


export const getAvailableBooksCount = async () => {
  const result = await Book.aggregate([
    { $group: { _id: null, total: { $sum: '$available_copies' } } }
  ]);
  return result[0]?.total || 0;
};


export const findAndPopulate = async (id, fields = '') => {
  return await Book.findById(id).select(fields);
};


export const findAvailableCopiesById = async (id) => {
  return await Book.findOne({ 
    _id: id, 
    available_copies: { $gt: 0 } 
  });
};