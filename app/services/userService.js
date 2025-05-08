import User from '../models/User.js';

export const create = async (userData) => {
  const user = new User({
    name: userData.name,
    email: userData.email,
    role: userData.role,
  });

  return await user.save();
};


export const findUserById = async (id) => {
  return await User.findById(id);
};


export const updateUser = async (id, userData) => {
  return await User.findByIdAndUpdate(
    id,
    {
      ...userData,
      updatedAt: Date.now(),
    },
    {
      new: true,
      runValidators: true,
    }
  );
};


export const countUsers = async () => {
  return await User.countDocuments();
};