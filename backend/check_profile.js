import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Client from './models/Client.js';
import FinancialProfile from './models/FinancialProfile.js';

dotenv.config();

const connUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finbridge';

async function run() {
  try {
    await mongoose.connect(connUri);
    const client = await Client.findOne({ email: 'johnybutterfly36@gmail.com' });
    console.log('Client:', client);
    if (client) {
      const profile = await FinancialProfile.findOne({ userId: client._id });
      console.log('Profile:', profile);
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
