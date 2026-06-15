import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Admin from '../models/Admin.js';
import Consultant from '../models/Consultant.js';
import Client from '../models/Client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const upsert = async (Model, query, data) => {
  const exists = await Model.findOne(query);
  if (exists) {
    console.log(`  ✓ Already exists: ${data.email}`);
    return;
  }
  await Model.create(data);
  console.log(`  ✅ Created: ${data.email}`);
};

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.\n');

  console.log('── Admins ──');
  const admins = [
    { name: 'Platform Administrator',          email: 'super.admin@finbridge.com',       password: 'superadmin123',       role: 'admin',            department: 'platform' },
    { name: 'CRM Manager',                     email: 'crm123@gmail.com',                password: 'crmadmin123',          role: 'crm-admin',        department: 'crm' },
    { name: 'Loans Department Admin',           email: 'loans.admin@finbridge.com',       password: 'loansadmin123',        role: 'department-admin', department: 'loans' },
    { name: 'Insurance Department Admin',       email: 'insurance.admin@finbridge.com',   password: 'insuranceadmin123',    role: 'department-admin', department: 'insurance' },
    { name: 'Investment Department Admin',      email: 'investment.admin@finbridge.com',  password: 'investmentadmin123',   role: 'department-admin', department: 'investment' },
    { name: 'Tax Services Department Admin',    email: 'tax.admin@finbridge.com',         password: 'taxadmin123',          role: 'department-admin', department: 'tax' },
    { name: 'Wealth Management Dept Admin',     email: 'wealth.admin@finbridge.com',      password: 'wealthadmin123',       role: 'department-admin', department: 'wealth' },
  ];
  for (const a of admins) {
    await upsert(Admin, { email: a.email }, { ...a, companyName: 'FinBridge Solutions Inc', isActive: true, isEmailVerified: true });
  }

  console.log('\n── Consultants ──');
  const consultants = [
    { name: 'Sanjay Kumar',  email: 'consultant1@finbridge.com', password: 'password123', department: 'loans' },
    { name: 'Anita Rao',     email: 'consultant2@finbridge.com', password: 'password123', department: 'loans' },
    { name: 'Vikram Sharma', email: 'consultant3@finbridge.com', password: 'password123', department: 'insurance' },
    { name: 'Priya Patel',   email: 'consultant4@finbridge.com', password: 'password123', department: 'investment' },
    { name: 'Rohan Das',     email: 'consultant5@finbridge.com', password: 'password123', department: 'tax' },
    { name: 'Meera Iyer',    email: 'consultant6@finbridge.com', password: 'password123', department: 'wealth' },
  ];
  for (const c of consultants) {
    await upsert(Consultant, { email: c.email }, { ...c, role: 'consultant', companyName: 'FinBridge Advisory', isActive: true, isEmailVerified: true });
  }

  console.log('\n── Clients ──');
  const clients = [
    { name: 'Alexander Vance', email: 'client1@finbridge.com', password: 'password123', phone: '+15550192', companyName: 'Vance Corp' },
    { name: 'Sarah Connor',    email: 'client2@finbridge.com', password: 'password123', phone: '+15550193', companyName: 'Cyberdyne LLC' },
  ];
  for (const c of clients) {
    await upsert(Client, { email: c.email }, { ...c, role: 'client', isActive: true, isEmailVerified: true });
  }

  console.log('\n✅ Done — no existing data was deleted.');
  process.exit(0);
};

seed().catch(err => { console.error(err.message); process.exit(1); });
