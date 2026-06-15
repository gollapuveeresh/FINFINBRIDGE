import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Admin from '../models/Admin.js';
import Consultant from '../models/Consultant.js';
import Client from '../models/Client.js';

// Resolve directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment configurations using absolute path to support execution from any directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finbridge';

const seedUsers = async () => {
  try {
    console.log(`Connecting to database: ${connUri.split('@').pop()} for seeding...`);
    await mongoose.connect(connUri);
    console.log('Database connected.');

    // 1. Clear existing users inside MongoDB collections
    console.log('Clearing all existing clients, consultants, and admins from the database...');
    await Client.deleteMany({});
    await Consultant.deleteMany({});
    await Admin.deleteMany({});
    console.log('Collections cleared.');

    // 2. Seed super admin and department admins
    console.log('Seeding administrators...');
    const adminAccounts = [
      {
        name: 'Platform Administrator',
        email: 'super.admin@finbridge.com',
        password: 'superadmin123',
        role: 'admin',
        department: 'platform',
        phone: '+18005550199',
        companyName: 'FinBridge Solutions Inc',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'CRM Manager',
        email: 'crm123@gmail.com',
        password: 'crmadmin123',
        role: 'crm-admin',
        department: 'crm',
        phone: '+18005550210',
        companyName: 'FinBridge Solutions Inc',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'CRM Executive',
        email: 'crm.executive@gmail.com',
        password: 'crmexec123',
        role: 'crm-admin',
        department: 'crm',
        phone: '+18005550211',
        companyName: 'FinBridge Solutions Inc',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Loans Department Admin',
        email: 'loans.admin@finbridge.com',
        password: 'loansadmin123',
        role: 'department-admin',
        department: 'loans',
        phone: '+18005550200',
        companyName: 'FinBridge Solutions Inc',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Insurance Department Admin',
        email: 'insurance.admin@finbridge.com',
        password: 'insuranceadmin123',
        role: 'department-admin',
        department: 'insurance',
        phone: '+18005550201',
        companyName: 'FinBridge Solutions Inc',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Investments Department Admin',
        email: 'investments.admin@finbridge.com',
        password: 'investmentsadmin123',
        role: 'department-admin',
        department: 'investments',
        phone: '+18005550202',
        companyName: 'FinBridge Solutions Inc',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Tax Services Department Admin',
        email: 'tax.admin@finbridge.com',
        password: 'taxadmin123',
        role: 'department-admin',
        department: 'tax',
        phone: '+18005550203',
        companyName: 'FinBridge Solutions Inc',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Wealth Management Department Admin',
        email: 'wealth.admin@finbridge.com',
        password: 'wealthadmin123',
        role: 'department-admin',
        department: 'wealth',
        phone: '+18005550204',
        companyName: 'FinBridge Solutions Inc',
        isActive: true,
        isEmailVerified: true
      }
    ];

    for (const account of adminAccounts) {
      await Admin.create(account);
    }
    console.log('Super admin and department admins seeded successfully.');

    // 3. Seed department consultants
    console.log('Seeding department consultants...');
    const consultants = [
      {
        name: 'Sanjay Kumar',
        email: 'consultant1@finbridge.com',
        password: 'password123',
        role: 'consultant',
        department: 'loans',
        phone: '+18005550101',
        companyName: 'FinBridge Advisory',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Anita Rao',
        email: 'consultant2@finbridge.com',
        password: 'password123',
        role: 'consultant',
        department: 'loans',
        phone: '+18005550102',
        companyName: 'FinBridge Advisory',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Vikram Sharma',
        email: 'consultant3@finbridge.com',
        password: 'password123',
        role: 'consultant',
        department: 'insurance',
        phone: '+18005550103',
        companyName: 'FinBridge Advisory',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Priya Patel',
        email: 'consultant4@finbridge.com',
        password: 'password123',
        role: 'consultant',
        department: 'investments',
        phone: '+18005550104',
        companyName: 'FinBridge Advisory',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Rohan Das',
        email: 'consultant5@finbridge.com',
        password: 'password123',
        role: 'consultant',
        department: 'tax',
        phone: '+18005550105',
        companyName: 'FinBridge Advisory',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Meera Iyer',
        email: 'consultant6@finbridge.com',
        password: 'password123',
        role: 'consultant',
        department: 'wealth',
        phone: '+18005550106',
        companyName: 'FinBridge Advisory',
        isActive: true,
        isEmailVerified: true
      }
    ];

    for (const cons of consultants) {
      await Consultant.create(cons);
    }
    console.log('Department consultants seeded successfully.');

    // 4. Seed 2 default Clients
    console.log('Seeding default clients...');
    const clients = [
      {
        name: 'Alexander Vance',
        email: 'client1@finbridge.com',
        password: 'password123',
        role: 'client',
        phone: '+15550192',
        companyName: 'Vance Corp',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Sarah Connor',
        email: 'client2@finbridge.com',
        password: 'password123',
        role: 'client',
        phone: '+15550193',
        companyName: 'Cyberdyne LLC',
        isActive: true,
        isEmailVerified: true
      }
    ];

    for (const cl of clients) {
      await Client.create(cl);
    }
    console.log('Default clients seeded successfully.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding accounts:', error.message);
    process.exit(1);
  }
};

seedUsers();
