// services/userService.js
import User from '../models/User.js';
import mongoose from 'mongoose';

export const validateUserIdInternal = (book_id) => {
  return mongoose.Types.ObjectId.isValid(book_id);
};

export const findUserById = async (id) => {
  return await User.findById(id);
};


export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};


export const countTotalUsers = async () => {
  return await User.countDocuments();
};


export const createUser = async (userData) => {
  const existingUser = await findUserByEmail(userData.email);
  if (existingUser) {
    return null;
  }

  const user = new User({
    name: userData.name,
    email: userData.email,
    role: userData.role,
  });

  return await user.save();
};



export const updateUserById = async (id, userData) => {
  if (userData.email) {
    const existingUser = await findUserByEmail(userData.email);

    if (existingUser && existingUser._id.toString() !== id) {
      return null;
    }
  }

  const updateData = {
    ...userData,
    updatedAt: Date.now()
  };

  const updateOptions = {
    new: true,
    runValidators: true 
  };

  return await User.findByIdAndUpdate(id, updateData, updateOptions);
};


