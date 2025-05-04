import User from'../models/User.js';

// Register a new user
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;

    const user = new User({
      name,
      email,
      role,
    });

    await user.save();

    res.status(201).json(
      user
    );
  } catch (err) {
    next(err);
  }
};

// Get user by ID
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).json(
      user
    );
  } catch (err) {
    next(err);
  }
};

// Update user profile
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        role,
        updatedAt: Date.now(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};