import mongoose from 'mongoose';
import 'dotenv/config.js';
const DatabaseConnect = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error('MONGODB_URL is not defined');
    }

    await mongoose.connect(process.env.MONGODB_URL);

    console.log('Database is connected Successfully');
  } catch (error) {
    console.error('Database connection failed');
    process.exit(1); // exit the process with a failure
  }
};

export default DatabaseConnect;
