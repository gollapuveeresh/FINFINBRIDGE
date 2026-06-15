import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const connUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finbridge';
const jwtSecret = process.env.JWT_SECRET;

async function run() {
  try {
    const token = jwt.sign(
      { userId: '6a2538dbc90b92a21f5d61cc', role: 'client' },
      jwtSecret,
      { expiresIn: '7d' }
    );
    console.log('Generated token:', token);

    console.log('\nCalling GET /api/financial-profile...');
    const profileRes = await fetch('http://127.0.0.1:5000/api/financial-profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Profile Response Status:', profileRes.status);
    const profileData = await profileRes.json();
    console.log('Profile Response Data:', JSON.stringify(profileData, null, 2));

    console.log('\nCalling GET /api/investments/summary...');
    const summaryRes = await fetch('http://127.0.0.1:5000/api/investments/summary', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Summary Response Status:', summaryRes.status);
    const summaryData = await summaryRes.json();
    console.log('Summary Response Data:', JSON.stringify(summaryData, null, 2));

  } catch (err) {
    console.error(err);
  }
}

run();
