import mongoose from 'mongoose';
import isEmail from 'validator/lib/isEmail.js';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: v => isEmail(v),
      message: props => `${props.value} is not a valid email!`
    },
  },
  role: {
    type: String,
    enum: ['student', 'faculty'],
    lowercase: true,
    trim: true,
    required: true,
    default: 'student',
  },
},
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', UserSchema);
export default User;