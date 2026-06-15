import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Client from './models/Client.js';

dotenv.config();

const connUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finbridge';

async function run() {
  try {
    await mongoose.connect(connUri);
    const clients = await Client.find({}, { name: 1, email: 1, isEmailVerified: 1, isActive: 1 });
    console.log('--- ALL CLIENTS ---');
    console.log(clients);
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
