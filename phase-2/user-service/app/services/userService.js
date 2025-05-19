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

  const savedUser = await user.save();
  
  return {
    id: savedUser._id,
    name: savedUser.name,
    email: savedUser.email,
    role: savedUser.role,
    created_at: savedUser.createdAt
  };
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

  const updatedUser = await User.findByIdAndUpdate(id, updateData, updateOptions);
  
  if (!updatedUser) {
    return null;
  }

  return {
    id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    created_at: updatedUser.createdAt,
    updated_at: updatedUser.updatedAt
  };
};


