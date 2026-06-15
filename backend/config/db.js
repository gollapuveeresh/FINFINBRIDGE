import mongoose from 'mongoose';

const connectDB = async (retries = 5, delay = 5000) => {
  const connUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finbridge';
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(connUri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB Connection Attempt ${i + 1} Failed: ${error.message}`);
      if (i === retries - 1) {
        console.error('All database connection attempts failed. Exiting...');
        process.exit(1);
      }
      console.log(`Retrying database connection in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export default connectDB;
