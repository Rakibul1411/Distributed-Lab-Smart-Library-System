import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './config/db.js';
import errorHandler from './middlewares/errorHandler.js';
import loanRoutes from './routes/loanRoutes.js';

const app = express();

connectDB();

// Middlewares - ORDER MATTERS!
app.use(cors());
app.use(morgan('dev')); 


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/', loanRoutes);

app.use(errorHandler);


const PORT = process.env.PORT || 8083;


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