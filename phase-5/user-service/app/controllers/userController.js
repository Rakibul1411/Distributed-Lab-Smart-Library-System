import { userService } from '../services/index.js';

// Register a new user
export const registerUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);

    if (!user) {
      return res.status(409).json({
        error: 'Email already registered'
      });
    }

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};


// Get user by ID
export const getUser = async (req, res, next) => {
  try {
    const user = await userService.findUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found'});
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};


// Update user profile
export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUserById(req.params.id, req.body);

    if (user === null) {
      return res.status(409).json({
        error: 'Email already registered'
      });
    }

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};