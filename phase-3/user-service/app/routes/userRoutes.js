import express from 'express';
import {
  registerUser,
  getUser,
  updateUser,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/', registerUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);

export default router;