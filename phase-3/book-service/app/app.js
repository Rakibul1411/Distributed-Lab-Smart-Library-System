import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './config/db.js';
import errorHandler from './middlewares/errorHandler.js';
import bookRoutes from './routes/bookRoutes.js';

const app = express();

connectDB();

// Middlewares - ORDER MATTERS!
app.use(cors()); // CORS first
app.use(morgan('dev')); // Logging


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/', bookRoutes);

app.use(errorHandler);


const PORT = process.env.PORT || 8082;


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from DB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});