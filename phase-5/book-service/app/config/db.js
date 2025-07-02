import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectWithRetry = () => {
  console.log('⏳ Attempting MongoDB connection...');

  mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
    .then(() => {
      console.log('✅ MongoDB Connected...');
    })
    .catch((err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
      setTimeout(connectWithRetry, 5000);
    });
};

export default connectWithRetry;
