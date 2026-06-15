import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import LoanProduct from '../models/LoanProduct.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finbridge';

// ─── 15 Banks ──────────────────────────────────────────────────────────────
const BANKS = [
  { name: 'HDFC Bank',          logo: 'hdfc',      website: 'https://www.hdfcbank.com' },
  { name: 'ICICI Bank',         logo: 'icici',     website: 'https://www.icicibank.com' },
  { name: 'State Bank of India',logo: 'sbi',       website: 'https://www.sbi.co.in' },
  { name: 'Axis Bank',          logo: 'axis',      website: 'https://www.axisbank.com' },
  { name: 'Kotak Mahindra Bank',logo: 'kotak',     website: 'https://www.kotak.com' },
  { name: 'Punjab National Bank',logo:'pnb',       website: 'https://www.pnbindia.in' },
  { name: 'Bank of Baroda',     logo: 'bob',       website: 'https://www.bankofbaroda.in' },
  { name: 'Canara Bank',        logo: 'canara',    website: 'https://www.canarabank.com' },
  { name: 'Union Bank of India',logo: 'ubi',       website: 'https://www.unionbankofindia.co.in' },
  { name: 'IndusInd Bank',      logo: 'indusind',  website: 'https://www.indusind.com' },
  { name: 'Yes Bank',           logo: 'yes',       website: 'https://www.yesbank.in' },
  { name: 'Federal Bank',       logo: 'federal',   website: 'https://www.federalbank.co.in' },
  { name: 'IDFC First Bank',    logo: 'idfc',      website: 'https://www.idfcfirstbank.com' },
  { name: 'Standard Chartered', logo: 'sc',        website: 'https://www.sc.com/in' },
  { name: 'Bajaj Finance',      logo: 'bajaj',     website: 'https://www.bajajfinserv.in' }
];

// Helper to pick bank by index cycling
const b = (i) => BANKS[i % BANKS.length];

// ─── Loan Products ─────────────────────────────────────────────────────────
// 6 categories × ~15 products each = 90 products

const loanProducts = [

  // ══════════════════════════════════════════════════════════════════════════
  // PERSONAL LOAN  (15 products)
  // ══════════════════════════════════════════════════════════════════════════
  {
    bankName: 'HDFC Bank', loanType: 'Personal Loan',
    minCreditScore: 720, maxCreditScore: 850, minMonthlyIncome: 25000,
    maxLoanAmount: 4000000, interestRate: 10.75, processingFee: 1.5,
    tenureMonths: 60, description: 'HDFC Personal Loan with instant approval for salaried individuals.',
    features: ['Instant disbursal', 'Zero collateral', 'Flexible tenure', 'Top-up facility'],
    eligibilityCriteria: 'Salaried employee with 2+ years experience', preApproved: true, featured: true
  },
  {
    bankName: 'ICICI Bank', loanType: 'Personal Loan',
    minCreditScore: 700, maxCreditScore: 850, minMonthlyIncome: 20000,
    maxLoanAmount: 5000000, interestRate: 11.25, processingFee: 1.0,
    tenureMonths: 72, description: 'ICICI Personal Loan with competitive rates and flexible repayment.',
    features: ['Online application', 'Quick processing', 'No prepayment charges after 12 months'],
    eligibilityCriteria: 'Salaried or self-employed professionals', preApproved: false, featured: true
  },
  {
    bankName: 'State Bank of India', loanType: 'Personal Loan',
    minCreditScore: 650, maxCreditScore: 850, minMonthlyIncome: 15000,
    maxLoanAmount: 2000000, interestRate: 12.50, processingFee: 0.5,
    tenureMonths: 48, description: 'SBI Xpress Credit personal loan for government & defense employees.',
    features: ['Low interest for govt employees', 'No prepayment charges', 'Simple documentation'],
    eligibilityCriteria: 'Government / PSU / defense employees', preApproved: false, featured: false
  },
  {
    bankName: 'Axis Bank', loanType: 'Personal Loan',
    minCreditScore: 700, maxCreditScore: 850, minMonthlyIncome: 22000,
    maxLoanAmount: 4000000, interestRate: 10.99, processingFee: 1.5,
    tenureMonths: 60, description: 'Axis Bank personal loan with same-day disbursal for premium customers.',
    features: ['Same day disbursal', 'Doorstep service', 'Balance transfer option'],
    eligibilityCriteria: 'Age 21–60, 2 years stable employment', preApproved: false, featured: false
  },
  {
    bankName: 'Kotak Mahindra Bank', loanType: 'Personal Loan',
    minCreditScore: 730, maxCreditScore: 850, minMonthlyIncome: 30000,
    maxLoanAmount: 3500000, interestRate: 10.99, processingFee: 1.75,
    tenureMonths: 60, description: 'Kotak personal loan offering attractive rates for high credit scorers.',
    features: ['Minimal documentation', 'Online tracking', 'Flexible EMI dates'],
    eligibilityCriteria: 'Salaried professional in metro cities', preApproved: true, featured: false
  },
  {
    bankName: 'Punjab National Bank', loanType: 'Personal Loan',
    minCreditScore: 620, maxCreditScore: 800, minMonthlyIncome: 12000,
    maxLoanAmount: 1000000, interestRate: 13.75, processingFee: 0.75,
    tenureMonths: 36, description: 'PNB Personal Loan for salaried employees of state/central govt.',
    features: ['Low processing fee', 'Minimal documentation', 'Wide branch network'],
    eligibilityCriteria: 'Government employees, pensioners', preApproved: false, featured: false
  },
  {
    bankName: 'Bank of Baroda', loanType: 'Personal Loan',
    minCreditScore: 640, maxCreditScore: 820, minMonthlyIncome: 15000,
    maxLoanAmount: 1500000, interestRate: 13.15, processingFee: 1.0,
    tenureMonths: 48, description: 'Bank of Baroda Personal Loan with flexible repayment options.',
    features: ['No hidden charges', 'Flexible tenure', 'Low EMI options'],
    eligibilityCriteria: 'Salaried with 1 year at current employer', preApproved: false, featured: false
  },
  {
    bankName: 'Bajaj Finance', loanType: 'Personal Loan',
    minCreditScore: 680, maxCreditScore: 850, minMonthlyIncome: 20000,
    maxLoanAmount: 5000000, interestRate: 13.00, processingFee: 2.0,
    tenureMonths: 84, description: 'Bajaj Finserv personal loan with highest loan amounts and flexible tenure.',
    features: ['Flexi loan facility', 'Part-prepayment allowed', 'Online management'],
    eligibilityCriteria: 'Age 21–67, salaried or self-employed', preApproved: false, featured: true
  },
  {
    bankName: 'IndusInd Bank', loanType: 'Personal Loan',
    minCreditScore: 710, maxCreditScore: 850, minMonthlyIncome: 25000,
    maxLoanAmount: 3000000, interestRate: 11.49, processingFee: 2.5,
    tenureMonths: 60, description: 'IndusInd personal loan with fast approval for premium customers.',
    features: ['Quick approval', 'Attractive rates for 750+ scores', 'Dedicated relationship manager'],
    eligibilityCriteria: 'Age 21–60, min 2 years employment', preApproved: false, featured: false
  },
  {
    bankName: 'Yes Bank', loanType: 'Personal Loan',
    minCreditScore: 690, maxCreditScore: 850, minMonthlyIncome: 20000,
    maxLoanAmount: 4000000, interestRate: 12.75, processingFee: 1.5,
    tenureMonths: 72, description: 'Yes Bank personal loan with competitive rates and quick processing.',
    features: ['Balance transfer', 'Top-up loan', 'Digital-first experience'],
    eligibilityCriteria: 'Resident Indian, age 21–65', preApproved: false, featured: false
  },
  {
    bankName: 'IDFC First Bank', loanType: 'Personal Loan',
    minCreditScore: 700, maxCreditScore: 850, minMonthlyIncome: 20000,
    maxLoanAmount: 4000000, interestRate: 10.49, processingFee: 1.0,
    tenureMonths: 60, description: 'IDFC First Bank offers one of the lowest interest rate personal loans.',
    features: ['Lowest rates in segment', 'No foreclosure charges', 'Digital disbursement'],
    eligibilityCriteria: 'Salaried employees of MNCs and corporates', preApproved: false, featured: true
  },
  {
    bankName: 'Standard Chartered', loanType: 'Personal Loan',
    minCreditScore: 750, maxCreditScore: 850, minMonthlyIncome: 40000,
    maxLoanAmount: 5000000, interestRate: 11.99, processingFee: 1.0,
    tenureMonths: 60, description: 'Standard Chartered personal loan for premium salaried customers.',
    features: ['Priority processing', 'Global banking relationship', 'Attractive loyalty rates'],
    eligibilityCriteria: 'Age 21–58, employed in select corporates', preApproved: true, featured: false
  },
  {
    bankName: 'Federal Bank', loanType: 'Personal Loan',
    minCreditScore: 660, maxCreditScore: 820, minMonthlyIncome: 15000,
    maxLoanAmount: 2500000, interestRate: 12.25, processingFee: 1.25,
    tenureMonths: 60, description: 'Federal Bank personal loan for NRIs and resident individuals.',
    features: ['NRI friendly', 'Quick processing', 'Minimal paperwork'],
    eligibilityCriteria: 'Resident Indian or NRI, salaried/self-employed', preApproved: false, featured: false
  },
  {
    bankName: 'Canara Bank', loanType: 'Personal Loan',
    minCreditScore: 630, maxCreditScore: 810, minMonthlyIncome: 12000,
    maxLoanAmount: 1500000, interestRate: 13.40, processingFee: 0.5,
    tenureMonths: 36, description: 'Canara Bank Personal Loan for government employees and pensioners.',
    features: ['Low processing charges', 'No guarantor required', 'Simple eligibility norms'],
    eligibilityCriteria: 'Central/state government employees, pensioners', preApproved: false, featured: false
  },
  {
    bankName: 'Union Bank of India', loanType: 'Personal Loan',
    minCreditScore: 640, maxCreditScore: 820, minMonthlyIncome: 15000,
    maxLoanAmount: 2000000, interestRate: 12.80, processingFee: 0.5,
    tenureMonths: 48, description: 'Union Bank personal loan with affordable EMI and flexible tenure.',
    features: ['No prepayment penalty', 'Online application', 'Nationwide branches'],
    eligibilityCriteria: 'Salaried with salary account in Union Bank', preApproved: false, featured: false
  },

  // ══════════════════════════════════════════════════════════════════════════
  // HOME LOAN  (15 products)
  // ══════════════════════════════════════════════════════════════════════════
  {
    bankName: 'HDFC Bank', loanType: 'Home Loan',
    minCreditScore: 700, maxCreditScore: 850, minMonthlyIncome: 50000,
    maxLoanAmount: 100000000, interestRate: 8.70, processingFee: 0.5,
    tenureMonths: 300, description: 'HDFC Home Loan with lowest rates for ready and under-construction properties.',
    features: ['Up to 30 year tenure', 'Top-up loan facility', 'Step-up EMI option', 'PMAY subsidy'],
    eligibilityCriteria: 'Salaried/self-employed, age 21–65', preApproved: false, featured: true
  },
  {
    bankName: 'State Bank of India', loanType: 'Home Loan',
    minCreditScore: 650, maxCreditScore: 850, minMonthlyIncome: 50000,
    maxLoanAmount: 75000000, interestRate: 8.50, processingFee: 0.35,
    tenureMonths: 360, description: 'SBI Home Loan with lowest rates in India for first-time buyers.',
    features: ['Zero prepayment charges', 'PMAY benefit up to ₹2.67L', 'No hidden charges', 'Overdraft facility'],
    eligibilityCriteria: 'Age 18–70, any nationality', preApproved: false, featured: true
  },
  {
    bankName: 'ICICI Bank', loanType: 'Home Loan',
    minCreditScore: 680, maxCreditScore: 850, minMonthlyIncome: 50000,
    maxLoanAmount: 100000000, interestRate: 8.75, processingFee: 0.5,
    tenureMonths: 360, description: 'ICICI Bank Home Loan with quick approval and doorstep service.',
    features: ['Online approval', 'Legal & technical support', 'Balance transfer facility'],
    eligibilityCriteria: 'Salaried/self-employed, property in India', preApproved: false, featured: false
  },
  {
    bankName: 'Axis Bank', loanType: 'Home Loan',
    minCreditScore: 700, maxCreditScore: 850, minMonthlyIncome: 50000,
    maxLoanAmount: 50000000, interestRate: 8.75, processingFee: 1.0,
    tenureMonths: 360, description: 'Axis Bank Home Loan with attractive interest rates and quick processing.',
    features: ['Interest rate concession for women', 'Shubh Aarambh zero EMI scheme', 'Top-up facility'],
    eligibilityCriteria: 'Indian resident, age 21–65', preApproved: false, featured: false
  },
  {
    bankName: 'Kotak Mahindra Bank', loanType: 'Home Loan',
    minCreditScore: 720, maxCreditScore: 850, minMonthlyIncome: 60000,
    maxLoanAmount: 100000000, interestRate: 8.85, processingFee: 0.5,
    tenureMonths: 240, description: 'Kotak Home Loan for premium salaried customers with fast disbursal.',
    features: ['Dedicated RM support', 'Digital documentation', 'Transparent pricing'],
    eligibilityCriteria: 'Min income ₹60K/month, age 21–60', preApproved: false, featured: false
  },
  {
    bankName: 'Punjab National Bank', loanType: 'Home Loan',
    minCreditScore: 650, maxCreditScore: 850, minMonthlyIncome: 50000,
    maxLoanAmount: 75000000, interestRate: 8.40, processingFee: 0.35,
    tenureMonths: 360, description: 'PNB Housing Finance Home Loan with attractive government employee rates.',
    features: ['Special govt employee rates', 'PMAY benefits', 'Simple documentation'],
    eligibilityCriteria: 'Salaried or self-employed Indian residents', preApproved: false, featured: false
  },
  {
    bankName: 'Bank of Baroda', loanType: 'Home Loan',
    minCreditScore: 650, maxCreditScore: 850, minMonthlyIncome: 50000,
    maxLoanAmount: 100000000, interestRate: 8.40, processingFee: 0.5,
    tenureMonths: 360, description: 'Bank of Baroda Home Loan with competitive rates and PMAY support.',
    features: ['Competitive rates', 'No prepayment charges', 'Balance transfer option'],
    eligibilityCriteria: 'Resident Indian or NRI, age 21–70', preApproved: false, featured: false
  },
  {
    bankName: 'Canara Bank', loanType: 'Home Loan',
    minCreditScore: 640, maxCreditScore: 830, minMonthlyIncome: 50000,
    maxLoanAmount: 75000000, interestRate: 8.45, processingFee: 0.5,
    tenureMonths: 360, description: 'Canara Bank Home Loan with lowest processing fee and wide network.',
    features: ['Low processing fees', 'Special rates for SC/ST', 'PMAY subsidy eligible'],
    eligibilityCriteria: 'Indian resident, age 21–65', preApproved: false, featured: false
  },
  {
    bankName: 'Union Bank of India', loanType: 'Home Loan',
    minCreditScore: 650, maxCreditScore: 840, minMonthlyIncome: 50000,
    maxLoanAmount: 75000000, interestRate: 8.35, processingFee: 0.5,
    tenureMonths: 360, description: 'Union Bank Home Loan at one of the lowest market rates.',
    features: ['Lowest processing fees', 'Online application', 'PMAY eligible'],
    eligibilityCriteria: 'Resident Indian, salaried or self-employed', preApproved: false, featured: false
  },
  {
    bankName: 'IndusInd Bank', loanType: 'Home Loan',
    minCreditScore: 700, maxCreditScore: 850, minMonthlyIncome: 55000,
    maxLoanAmount: 50000000, interestRate: 9.25, processingFee: 1.0,
    tenureMonths: 300, description: 'IndusInd Bank premium home loan with dedicated relationship manager.',
    features: ['Premium customer service', 'Flexible disbursement', 'No prepayment charges'],
    eligibilityCriteria: 'Salaried in metro/Tier-1 cities, age 21–60', preApproved: false, featured: false
  },
  {
    bankName: 'Yes Bank', loanType: 'Home Loan',
    minCreditScore: 680, maxCreditScore: 850, minMonthlyIncome: 50000,
    maxLoanAmount: 75000000, interestRate: 9.15, processingFee: 1.0,
    tenureMonths: 360, description: 'Yes Bank Home Loan with quick approval and digital-first experience.',
    features: ['Digital disbursement', 'PMAY support', 'Part payment facility'],
    eligibilityCriteria: 'Resident Indian or NRI, age 21–65', preApproved: false, featured: false
  },
  {
    bankName: 'IDFC First Bank', loanType: 'Home Loan',
    minCreditScore: 700, maxCreditScore: 850, minMonthlyIncome: 50000,
    maxLoanAmount: 100000000, interestRate: 8.85, processingFee: 0.5,
    tenureMonths: 360, description: 'IDFC First Bank Home Loan with attractive rates and zero prepayment charges.',
    features: ['Zero foreclosure charges', 'Transparent pricing', 'Online approval'],
    eligibilityCriteria: 'Age 21–65, income verifiable', preApproved: false, featured: true
  },
  {
    bankName: 'Federal Bank', loanType: 'Home Loan',
    minCreditScore: 660, maxCreditScore: 830, minMonthlyIncome: 50000,
    maxLoanAmount: 50000000, interestRate: 8.80, processingFee: 0.5,
    tenureMonths: 300, description: 'Federal Bank Home Loan for NRIs and resident Indians.',
    features: ['NRI-friendly', 'Quick processing', 'PMAY eligible'],
    eligibilityCriteria: 'Resident Indian or NRI, age 21–65', preApproved: false, featured: false
  },
  {
    bankName: 'Standard Chartered', loanType: 'Home Loan',
    minCreditScore: 750, maxCreditScore: 850, minMonthlyIncome: 80000,
    maxLoanAmount: 200000000, interestRate: 9.00, processingFee: 1.0,
    tenureMonths: 360, description: 'Standard Chartered Home Loan for premium global customers.',
    features: ['Highest loan amounts', 'Premium customer service', 'Global income acceptance'],
    eligibilityCriteria: 'High net worth individuals, NRIs with foreign income', preApproved: false, featured: false
  },
  {
    bankName: 'Bajaj Finance', loanType: 'Home Loan',
    minCreditScore: 680, maxCreditScore: 850, minMonthlyIncome: 50000,
    maxLoanAmount: 75000000, interestRate: 8.60, processingFee: 0.5,
    tenureMonths: 360, description: 'Bajaj Housing Finance Home Loan with attractive rates and online processing.',
    features: ['Online apply & track', 'Highest LTV ratio', 'Flexible tenure', 'PMAY eligible'],
    eligibilityCriteria: 'Salaried or self-employed, age 21–70', preApproved: false, featured: false
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CAR LOAN  (15 products)
  // ══════════════════════════════════════════════════════════════════════════
  {
    bankName: 'HDFC Bank', loanType: 'Car Loan',
    minCreditScore: 680, maxCreditScore: 850, minMonthlyIncome: 25000,
    maxLoanAmount: 10000000, interestRate: 8.75, processingFee: 0.5,
    tenureMonths: 84, description: 'HDFC Car Loan with 100% on-road funding and instant approval.',
    features: ['100% on-road finance', 'Instant disbursement', 'New & pre-owned cars', 'No collateral'],
    eligibilityCriteria: 'Salaried/self-employed, age 21–65', preApproved: true, featured: true
  },
  {
    bankName: 'State Bank of India', loanType: 'Car Loan',
    minCreditScore: 650, maxCreditScore: 850, minMonthlyIncome: 25000,
    maxLoanAmount: 5000000, interestRate: 8.65, processingFee: 0.51,
    tenureMonths: 84, description: 'SBI Car Loan with lowest interest rate for new and used vehicles.',
    features: ['Lowest rates', 'Zero prepayment charges', 'Online application', 'PMAY eligible'],
    eligibilityCriteria: 'Indian residents, salaried/self-employed', preApproved: false, featured: true
  },
  {
    bankName: 'ICICI Bank', loanType: 'Car Loan',
    minCreditScore: 680, maxCreditScore: 850, minMonthlyIncome: 25000,
    maxLoanAmount: 10000000, interestRate: 9.10, processingFee: 1.0,
    tenureMonths: 84, description: 'ICICI Bank car loan with fast approval and pan-India dealership network.',
    features: ['Tie-up with 3000+ dealers', 'Online approval in 30 minutes', 'Flexible repayment'],
    eligibilityCriteria: 'Age 21–65, employed/self-employed', preApproved: false, featured: false
  },
  {
    bankName: 'Axis Bank', loanType: 'Car Loan',
    minCreditScore: 680, maxCreditScore: 850, minMonthlyIncome: 25000,
    maxLoanAmount: 10000000, interestRate: 8.95, processingFee: 3500,
    tenureMonths: 84, description: 'Axis Bank car loan with competitive rates for premium car buyers.',
    features: ['Up to 100% financing', 'Online application', 'Long tenure option'],
    eligibilityCriteria: 'Salaried or self-employed', preApproved: false, featured: false
  },
  {
    bankName: 'Kotak Mahindra Bank', loanType: 'Car Loan',
    minCreditScore: 700, maxCreditScore: 850, minMonthlyIncome: 30000,
    maxLoanAmount: 10000000, interestRate: 9.00, processingFee: 1.0,
    tenureMonths: 84, description: 'Kotak car loan with digital-first experience and competitive rates.',
    features: ['Digital application', 'Flexible tenure', 'No guarantor required'],
    eligibilityCriteria: 'Salaried with 1 year employment', preApproved: false, featured: false
  },
  {
    bankName: 'Punjab National Bank', loanType: 'Car Loan',
    minCreditScore: 640, maxCreditScore: 820, minMonthlyIncome: 25000,
    maxLoanAmount: 5000000, interestRate: 9.25, processingFee: 0.5,
    tenureMonths: 60, description: 'PNB car loan with special rates for government employees.',
    features: ['Special govt rates', 'Wide branch network', 'Simple documentation'],
    eligibilityCriteria: 'Salaried or self-employed residents', preApproved: false, featured: false
  },
  {
    bankName: 'Bank of Baroda', loanType: 'Car Loan',
    minCreditScore: 650, maxCreditScore: 840, minMonthlyIncome: 25000,
    maxLoanAmount: 5000000, interestRate: 8.80, processingFee: 0.5,
    tenureMonths: 84, description: 'Bank of Baroda car loan with competitive rates and wide reach.',
    features: ['Competitive rates', 'No hidden charges', 'Quick processing'],
    eligibilityCriteria: 'Indian residents, salaried or self-employed', preApproved: false, featured: false
  },
  {
    bankName: 'Bajaj Finance', loanType: 'Car Loan',
    minCreditScore: 670, maxCreditScore: 850, minMonthlyIncome: 25000,
    maxLoanAmount: 15000000, interestRate: 10.99, processingFee: 2.0,
    tenureMonths: 84, description: 'Bajaj Auto Finance for new and used vehicles with flexible options.',
    features: ['New & used cars', 'Part payment allowed', 'Easy digital process'],
    eligibilityCriteria: 'Age 21–65, employed or self-employed', preApproved: false, featured: false
  },
  {
    bankName: 'IndusInd Bank', loanType: 'Car Loan',
    minCreditScore: 690, maxCreditScore: 850, minMonthlyIncome: 30000,
    maxLoanAmount: 10000000, interestRate: 9.25, processingFee: 2.0,
    tenureMonths: 84, description: 'IndusInd Bank car loan with loyalty rates for premium customers.',
    features: ['Loyalty pricing', 'Doorstep service', 'Quick turnaround'],
    eligibilityCriteria: 'Salaried/self-employed, age 21–65', preApproved: false, featured: false
  },
  {
    bankName: 'Yes Bank', loanType: 'Car Loan',
    minCreditScore: 680, maxCreditScore: 850, minMonthlyIncome: 25000,
    maxLoanAmount: 10000000, interestRate: 9.75, processingFee: 1.5,
    tenureMonths: 84, description: 'Yes Bank car loan with digital application and quick approval.',
    features: ['Digital-first', 'Quick disbursement', 'Competitive rates'],
    eligibilityCriteria: 'Resident Indian, age 21–65', preApproved: false, featured: false
  },
  {
    bankName: 'IDFC First Bank', loanType: 'Car Loan',
    minCreditScore: 700, maxCreditScore: 850, minMonthlyIncome: 25000,
    maxLoanAmount: 10000000, interestRate: 9.00, processingFee: 1.0,
    tenureMonths: 84, description: 'IDFC First Bank new car loan with zero foreclosure charges.',
    features: ['Zero foreclosure charges', 'Lowest processing fee', 'Online approval'],
    eligibilityCriteria: 'Age 21–65, income verifiable', preApproved: false, featured: false
  },
  {
    bankName: 'Federal Bank', loanType: 'Car Loan',
    minCreditScore: 660, maxCreditScore: 830, minMonthlyIncome: 25000,
    maxLoanAmount: 7500000, interestRate: 9.50, processingFee: 1.0,
    tenureMonths: 72, description: 'Federal Bank car loan with NRI-friendly policies.',
    features: ['NRI-friendly', 'Fast processing', 'Flexible repayment'],
    eligibilityCriteria: 'Resident Indian or NRI', preApproved: false, featured: false
  },
  {
    bankName: 'Standard Chartered', loanType: 'Car Loan',
    minCreditScore: 720, maxCreditScore: 850, minMonthlyIncome: 50000,
    maxLoanAmount: 20000000, interestRate: 9.50, processingFee: 1.0,
    tenureMonths: 84, description: 'Standard Chartered premium car loan for luxury vehicle purchases.',
    features: ['Luxury vehicle financing', 'Global income acceptance', 'Priority service'],
    eligibilityCriteria: 'High net worth, premium salary', preApproved: false, featured: false
  },
  {
    bankName: 'Canara Bank', loanType: 'Car Loan',
    minCreditScore: 640, maxCreditScore: 820, minMonthlyIncome: 25000,
    maxLoanAmount: 5000000, interestRate: 9.30, processingFee: 0.25,
    tenureMonths: 60, description: 'Canara Bank car loan with lowest processing charges.',
    features: ['Zero processing for govt employees', 'Wide network', 'Simple documentation'],
    eligibilityCriteria: 'Indian residents, salaried or self-employed', preApproved: false, featured: false
  },
  {
    bankName: 'Union Bank of India', loanType: 'Car Loan',
    minCreditScore: 640, maxCreditScore: 820, minMonthlyIncome: 25000,
    maxLoanAmount: 5000000, interestRate: 9.20, processingFee: 0.5,
    tenureMonths: 60, description: 'Union Bank car loan with competitive EMI and affordable rates.',
    features: ['Low EMI', 'No hidden charges', 'Digital application'],
    eligibilityCriteria: 'Salaried or self-employed Indians', preApproved: false, featured: false
  },

  // ══════════════════════════════════════════════════════════════════════════
  // EDUCATION LOAN  (15 products)
  // ══════════════════════════════════════════════════════════════════════════
  {
    bankName: 'State Bank of India', loanType: 'Education Loan',
    minCreditScore: 600, maxCreditScore: 850, minMonthlyIncome: 0,
    maxLoanAmount: 15000000, interestRate: 8.15, processingFee: 0,
    tenureMonths: 180, description: 'SBI Student Loan Scheme covering tuition, hostel & expenses for India & abroad.',
    features: ['No collateral up to ₹7.5L', 'Moratorium period during study', 'Tax benefit u/s 80E', 'CSIS subsidy'],
    eligibilityCriteria: 'Indian student admitted to recognised institution', preApproved: false, featured: true
  },
  {
    bankName: 'HDFC Bank', loanType: 'Education Loan',
    minCreditScore: 620, maxCreditScore: 850, minMonthlyIncome: 0,
    maxLoanAmount: 15000000, interestRate: 9.55, processingFee: 1.0,
    tenureMonths: 180, description: 'HDFC Credila Education Loan for India and overseas studies.',
    features: ['Quick approval', 'Covers living expenses', 'Flexible repayment', 'Online tracking'],
    eligibilityCriteria: 'Indian student with confirmed admission', preApproved: false, featured: true
  },
  {
    bankName: 'Axis Bank', loanType: 'Education Loan',
    minCreditScore: 620, maxCreditScore: 850, minMonthlyIncome: 0,
    maxLoanAmount: 7500000, interestRate: 13.70, processingFee: 1.5,
    tenureMonths: 180, description: 'Axis Bank education loan for India and abroad with competitive rates.',
    features: ['No collateral up to ₹4L', 'Tax benefit u/s 80E', 'Moratorium period'],
    eligibilityCriteria: 'Indian student admitted to recognised course', preApproved: false, featured: false
  },
  {
    bankName: 'ICICI Bank', loanType: 'Education Loan',
    minCreditScore: 650, maxCreditScore: 850, minMonthlyIncome: 0,
    maxLoanAmount: 10000000, interestRate: 10.25, processingFee: 1.0,
    tenureMonths: 180, description: 'ICICI Bank education loan with fast processing and wide institution coverage.',
    features: ['Online pre-approval', 'Wide institution list', 'Tax benefits', 'Moratorium support'],
    eligibilityCriteria: 'Indian citizen with confirmed admission', preApproved: false, featured: false
  },
  {
    bankName: 'Canara Bank', loanType: 'Education Loan',
    minCreditScore: 580, maxCreditScore: 830, minMonthlyIncome: 0,
    maxLoanAmount: 40000000, interestRate: 9.90, processingFee: 0,
    tenureMonths: 180, description: 'Canara Bank Vidya Turant – fast education loan for IITs and IIMs.',
    features: ['Quick sanction for premier institutions', 'No margin for ₹4L loans', 'Interest subsidy eligible'],
    eligibilityCriteria: 'Students of premier Indian institutions', preApproved: false, featured: false
  },
  {
    bankName: 'Punjab National Bank', loanType: 'Education Loan',
    minCreditScore: 590, maxCreditScore: 830, minMonthlyIncome: 0,
    maxLoanAmount: 10000000, interestRate: 9.55, processingFee: 0,
    tenureMonths: 180, description: 'PNB Saraswati Education Loan for higher studies in India and abroad.',
    features: ['No processing fee', 'Moratorium period', 'Tax benefit u/s 80E', 'No collateral up to ₹7.5L'],
    eligibilityCriteria: 'Indian national, admitted to recognised course', preApproved: false, featured: false
  },
  {
    bankName: 'Bank of Baroda', loanType: 'Education Loan',
    minCreditScore: 590, maxCreditScore: 830, minMonthlyIncome: 0,
    maxLoanAmount: 12500000, interestRate: 9.70, processingFee: 0,
    tenureMonths: 180, description: 'Bank of Baroda Baroda Scholar for studies in India & abroad.',
    features: ['No collateral up to ₹7.5L', 'Moratorium period', 'Tax deduction u/s 80E'],
    eligibilityCriteria: 'Indian students, admitted to full-time courses', preApproved: false, featured: false
  },
  {
    bankName: 'Kotak Mahindra Bank', loanType: 'Education Loan',
    minCreditScore: 650, maxCreditScore: 850, minMonthlyIncome: 0,
    maxLoanAmount: 15000000, interestRate: 11.50, processingFee: 1.5,
    tenureMonths: 180, description: 'Kotak Mahindra education loan for premier institutions abroad.',
    features: ['Covers living expenses', 'Forex assistance', 'Moratorium period', 'Part disbursement'],
    eligibilityCriteria: 'Students admitted to top institutions globally', preApproved: false, featured: false
  },
  {
    bankName: 'IndusInd Bank', loanType: 'Education Loan',
    minCreditScore: 640, maxCreditScore: 850, minMonthlyIncome: 0,
    maxLoanAmount: 10000000, interestRate: 12.00, processingFee: 1.5,
    tenureMonths: 180, description: 'IndusInd Bank education loan with competitive rates for abroad studies.',
    features: ['Abroad studies focus', 'Moratorium period', 'Tax benefits', 'Quick approval'],
    eligibilityCriteria: 'Indian students with abroad admission letter', preApproved: false, featured: false
  },
  {
    bankName: 'Union Bank of India', loanType: 'Education Loan',
    minCreditScore: 580, maxCreditScore: 830, minMonthlyIncome: 0,
    maxLoanAmount: 10000000, interestRate: 9.30, processingFee: 0,
    tenureMonths: 180, description: 'Union Bank education loan with interest subsidy scheme for EWS students.',
    features: ['Interest subsidy for EWS', 'No collateral up to ₹7.5L', 'Tax benefit', 'Moratorium period'],
    eligibilityCriteria: 'Indian national, recognised course', preApproved: false, featured: false
  },
  {
    bankName: 'Yes Bank', loanType: 'Education Loan',
    minCreditScore: 640, maxCreditScore: 850, minMonthlyIncome: 0,
    maxLoanAmount: 10000000, interestRate: 12.50, processingFee: 1.0,
    tenureMonths: 180, description: 'Yes Bank education loan with flexible repayment and quick approval.',
    features: ['Quick approval', 'Flexible repayment', 'Moratorium period', 'Covers all expenses'],
    eligibilityCriteria: 'Indian students with admission confirmation', preApproved: false, featured: false
  },
  {
    bankName: 'IDFC First Bank', loanType: 'Education Loan',
    minCreditScore: 650, maxCreditScore: 850, minMonthlyIncome: 0,
    maxLoanAmount: 5000000, interestRate: 10.99, processingFee: 0.5,
    tenureMonths: 180, description: 'IDFC First Bank education loan with zero collateral up to ₹50L.',
    features: ['Zero collateral up to ₹50L', 'Online process', 'Tax benefit', 'Moratorium'],
    eligibilityCriteria: 'Indian students, recognized institution', preApproved: false, featured: false
  },
  {
    bankName: 'Federal Bank', loanType: 'Education Loan',
    minCreditScore: 620, maxCreditScore: 830, minMonthlyIncome: 0,
    maxLoanAmount: 10000000, interestRate: 10.05, processingFee: 0,
    tenureMonths: 180, description: 'Federal Bank education loan for NRI students and resident Indians.',
    features: ['NRI-friendly', 'Quick processing', 'Moratorium period', 'Tax benefits'],
    eligibilityCriteria: 'Resident Indian or NRI student', preApproved: false, featured: false
  },
  {
    bankName: 'Standard Chartered', loanType: 'Education Loan',
    minCreditScore: 700, maxCreditScore: 850, minMonthlyIncome: 0,
    maxLoanAmount: 30000000, interestRate: 12.00, processingFee: 1.5,
    tenureMonths: 180, description: 'Standard Chartered education loan for top global institutions.',
    features: ['Global institution network', 'High loan amount', 'Moratorium period', 'Premium service'],
    eligibilityCriteria: 'Students admitted to top 200 global universities', preApproved: false, featured: false
  },
  {
    bankName: 'Bajaj Finance', loanType: 'Education Loan',
    minCreditScore: 650, maxCreditScore: 850, minMonthlyIncome: 0,
    maxLoanAmount: 5000000, interestRate: 14.00, processingFee: 2.0,
    tenureMonths: 60, description: 'Bajaj Finserv education loan for professional courses and skill development.',
    features: ['Short tenure option', 'Online application', 'Quick disbursal', 'No collateral'],
    eligibilityCriteria: 'Students of professional courses', preApproved: false, featured: false
  },

  // ══════════════════════════════════════════════════════════════════════════
  // BUSINESS LOAN  (15 products)
  // ══════════════════════════════════════════════════════════════════════════
  {
    bankName: 'HDFC Bank', loanType: 'Business Loan',
    minCreditScore: 680, maxCreditScore: 850, minMonthlyIncome: 50000,
    maxLoanAmount: 5000000, interestRate: 12.50, processingFee: 2.0,
    tenureMonths: 48, description: 'HDFC Business Loan for small businesses with quick approval.',
    features: ['Collateral-free', 'Quick approval', 'Working capital support', 'Overdraft option'],
    eligibilityCriteria: 'Business with 3+ years vintage, turnover ₹40L+', preApproved: false, featured: true
  },
  {
    bankName: 'State Bank of India', loanType: 'Business Loan',
    minCreditScore: 650, maxCreditScore: 850, minMonthlyIncome: 40000,
    maxLoanAmount: 25000000, interestRate: 11.25, processingFee: 1.0,
    tenureMonths: 60, description: 'SBI SME loan with government support schemes for MSMEs.',
    features: ['MSME government schemes', 'Mudra loan integration', 'Working capital', 'Equipment finance'],
    eligibilityCriteria: 'MSMEs registered under Udyam, 2+ years vintage', preApproved: false, featured: true
  },
  {
    bankName: 'ICICI Bank', loanType: 'Business Loan',
    minCreditScore: 700, maxCreditScore: 850, minMonthlyIncome: 50000,
    maxLoanAmount: 10000000, interestRate: 14.49, processingFee: 2.0,
    tenureMonths: 48, description: 'ICICI Bank Business Loan with instant online approval.',
    features: ['Instant online disbursal', 'Digital banking integration', 'No collateral', 'Flexible tenure'],
    eligibilityCriteria: 'Business 3+ years, filing ITR minimum ₹6L annually', preApproved: false, featured: false
  },
  {
    bankName: 'Axis Bank', loanType: 'Business Loan',
    minCreditScore: 680, maxCreditScore: 850, minMonthlyIncome: 40000,
    maxLoanAmount: 7500000, interestRate: 14.25, processingFee: 2.0,
    tenureMonths: 48, description: 'Axis Bank Business Loan for retailers, traders and service providers.',
    features: ['No collateral required', 'Online application', 'Fast disbursement', 'Overdraft facility'],
    eligibilityCriteria: 'Proprietor/partnership, 2+ years business vintage', preApproved: false, featured: false
  },
  {
    bankName: 'Kotak Mahindra Bank', loanType: 'Business Loan',
    minCreditScore: 700, maxCreditScore: 850, minMonthlyIncome: 60000,
    maxLoanAmount: 7500000, interestRate: 14.99, processingFee: 2.0,
    tenureMonths: 48, description: 'Kotak Business Loan for SMEs and startups.',
    features: ['Collateral-free', 'Digital process', 'Quick approval', 'Flexible repayment'],
    eligibilityCriteria: 'Self-employed, 3+ years in business, profitable', preApproved: false, featured: false
  },
  {
    bankName: 'Punjab National Bank', loanType: 'Business Loan',
    minCreditScore: 640, maxCreditScore: 820, minMonthlyIncome: 30000,
    maxLoanAmount: 10000000, interestRate: 12.25, processingFee: 1.0,
    tenureMonths: 60, description: 'PNB Business Loan with government-backed CGTMSE cover.',
    features: ['CGTMSE cover', 'MSME priority lending', 'Low rates for priority sector'],
    eligibilityCriteria: 'MSME businesses under Udyam, 2+ years vintage', preApproved: false, featured: false
  },
  {
    bankName: 'Bank of Baroda', loanType: 'Business Loan',
    minCreditScore: 650, maxCreditScore: 840, minMonthlyIncome: 30000,
    maxLoanAmount: 10000000, interestRate: 11.90, processingFee: 1.0,
    tenureMonths: 60, description: 'Bank of Baroda Business Loan with MUDRA and CGTMSE benefits.',
    features: ['MUDRA scheme eligible', 'CGTMSE coverage', 'Quick sanction', 'Simple docs'],
    eligibilityCriteria: 'Registered MSME, 2+ years operation', preApproved: false, featured: false
  },
  {
    bankName: 'Bajaj Finance', loanType: 'Business Loan',
    minCreditScore: 670, maxCreditScore: 850, minMonthlyIncome: 40000,
    maxLoanAmount: 5000000, interestRate: 18.00, processingFee: 3.0,
    tenureMonths: 36, description: 'Bajaj Finserv Business Loan for small businesses with quick disbursal.',
    features: ['12-hour approval', 'Flexible tenure', 'Part prepayment allowed', 'Online tracking'],
    eligibilityCriteria: 'Self-employed, 3+ years business, KYC complete', preApproved: false, featured: false
  },
  {
    bankName: 'IndusInd Bank', loanType: 'Business Loan',
    minCreditScore: 700, maxCreditScore: 850, minMonthlyIncome: 50000,
    maxLoanAmount: 7500000, interestRate: 15.00, processingFee: 2.5,
    tenureMonths: 48, description: 'IndusInd Bank business loan for growing SMEs.',
    features: ['Dedicated relationship manager', 'Quick disbursement', 'Flexible repayment'],
    eligibilityCriteria: 'Business 3+ years, profitable, KYC done', preApproved: false, featured: false
  },
  {
    bankName: 'Yes Bank', loanType: 'Business Loan',
    minCreditScore: 680, maxCreditScore: 850, minMonthlyIncome: 40000,
    maxLoanAmount: 5000000, interestRate: 15.99, processingFee: 2.5,
    tenureMonths: 36, description: 'Yes Bank Business Loan with quick sanction and digital disbursement.',
    features: ['Digital disbursement', 'Quick sanction', 'No collateral', 'MSME focused'],
    eligibilityCriteria: 'Self-employed/business owner, 2+ years', preApproved: false, featured: false
  },
  {
    bankName: 'IDFC First Bank', loanType: 'Business Loan',
    minCreditScore: 680, maxCreditScore: 850, minMonthlyIncome: 40000,
    maxLoanAmount: 10000000, interestRate: 14.75, processingFee: 2.0,
    tenureMonths: 48, description: 'IDFC First Bank business loan with competitive rates and zero prepayment.',
    features: ['Zero foreclosure charges', 'Digital process', 'Quick disbursement'],
    eligibilityCriteria: 'Business vintage 2+ years, profitable', preApproved: false, featured: false
  },
  {
    bankName: 'Federal Bank', loanType: 'Business Loan',
    minCreditScore: 660, maxCreditScore: 830, minMonthlyIncome: 30000,
    maxLoanAmount: 5000000, interestRate: 13.50, processingFee: 1.5,
    tenureMonths: 36, description: 'Federal Bank business loan for small traders and exporters.',
    features: ['Export-friendly', 'Quick processing', 'Trade finance available'],
    eligibilityCriteria: 'Traders, exporters, SMEs with 2+ years vintage', preApproved: false, featured: false
  },
  {
    bankName: 'Standard Chartered', loanType: 'Business Loan',
    minCreditScore: 750, maxCreditScore: 850, minMonthlyIncome: 100000,
    maxLoanAmount: 50000000, interestRate: 13.50, processingFee: 1.5,
    tenureMonths: 60, description: 'Standard Chartered Business Loan for corporates and large SMEs.',
    features: ['High loan amounts', 'Global business support', 'Trade finance', 'Priority processing'],
    eligibilityCriteria: 'Companies with turnover ₹1Cr+, profitable 3 years', preApproved: false, featured: false
  },
  {
    bankName: 'Canara Bank', loanType: 'Business Loan',
    minCreditScore: 630, maxCreditScore: 820, minMonthlyIncome: 25000,
    maxLoanAmount: 10000000, interestRate: 11.50, processingFee: 0.5,
    tenureMonths: 60, description: 'Canara Bank MSME loan with CGTMSE guarantee and government priority.',
    features: ['CGTMSE guarantee', 'Low processing fees', 'Priority sector rates', 'MUDRA eligible'],
    eligibilityCriteria: 'MSME units, 2+ years, any industry sector', preApproved: false, featured: false
  },
  {
    bankName: 'Union Bank of India', loanType: 'Business Loan',
    minCreditScore: 640, maxCreditScore: 820, minMonthlyIncome: 30000,
    maxLoanAmount: 10000000, interestRate: 11.75, processingFee: 1.0,
    tenureMonths: 60, description: 'Union Bank MSME loan with SIDBI refinance benefits.',
    features: ['SIDBI refinance eligible', 'MUDRA loan', 'Working capital', 'Equipment finance'],
    eligibilityCriteria: 'MSME, Udyam registration, 2+ years', preApproved: false, featured: false
  },

  // ══════════════════════════════════════════════════════════════════════════
  // GOLD LOAN  (15 products)
  // ══════════════════════════════════════════════════════════════════════════
  {
    bankName: 'HDFC Bank', loanType: 'Gold Loan',
    minCreditScore: 550, maxCreditScore: 850, minMonthlyIncome: 10000,
    maxLoanAmount: 5000000, interestRate: 10.50, processingFee: 1.0,
    tenureMonths: 24, description: 'HDFC Bank Gold Loan with instant disbursal and high LTV.',
    features: ['Instant disbursal', 'High LTV up to 75%', 'No prepayment charges', 'Bullet repayment'],
    eligibilityCriteria: 'Age 21–65, gold ornaments as collateral', preApproved: false, featured: true
  },
  {
    bankName: 'State Bank of India', loanType: 'Gold Loan',
    minCreditScore: 500, maxCreditScore: 850, minMonthlyIncome: 8000,
    maxLoanAmount: 2000000, interestRate: 8.75, processingFee: 0.5,
    tenureMonths: 36, description: 'SBI Gold Loan at lowest rate with flexible repayment.',
    features: ['Lowest rates', 'Max tenure 36 months', 'Online application', 'Pan-India availability'],
    eligibilityCriteria: 'Indian resident, 18+ years old', preApproved: false, featured: true
  },
  {
    bankName: 'ICICI Bank', loanType: 'Gold Loan',
    minCreditScore: 550, maxCreditScore: 850, minMonthlyIncome: 10000,
    maxLoanAmount: 1000000, interestRate: 11.00, processingFee: 1.0,
    tenureMonths: 12, description: 'ICICI Bank Gold Loan for quick liquidity with minimal documentation.',
    features: ['Quick 30-min disbursal', 'Minimal docs', 'High LTV', 'Part payment allowed'],
    eligibilityCriteria: 'Age 18+, any resident Indian', preApproved: false, featured: false
  },
  {
    bankName: 'Axis Bank', loanType: 'Gold Loan',
    minCreditScore: 550, maxCreditScore: 850, minMonthlyIncome: 10000,
    maxLoanAmount: 2000000, interestRate: 12.00, processingFee: 1.0,
    tenureMonths: 36, description: 'Axis Bank Gold Loan with transparent pricing and quick approval.',
    features: ['Transparent pricing', 'Same-day disbursal', 'Flexible repayment', 'No income proof needed'],
    eligibilityCriteria: 'Age 21+, gold ornaments pledged', preApproved: false, featured: false
  },
  {
    bankName: 'Kotak Mahindra Bank', loanType: 'Gold Loan',
    minCreditScore: 580, maxCreditScore: 850, minMonthlyIncome: 12000,
    maxLoanAmount: 3000000, interestRate: 10.00, processingFee: 1.5,
    tenureMonths: 24, description: 'Kotak Gold Loan with fastest approval and highest loan-to-value.',
    features: ['Fastest approval', 'High LTV 85%', 'Online auction alerts', 'Gold safe storage'],
    eligibilityCriteria: 'Indian resident, age 21+, gold ornaments 18-22 carat', preApproved: false, featured: false
  },
  {
    bankName: 'Punjab National Bank', loanType: 'Gold Loan',
    minCreditScore: 500, maxCreditScore: 830, minMonthlyIncome: 8000,
    maxLoanAmount: 1000000, interestRate: 9.70, processingFee: 0.5,
    tenureMonths: 12, description: 'PNB Gold Loan at highly competitive rates with wide branch availability.',
    features: ['Low rates', 'Wide branch network', 'No income proof', 'Quick disbursal'],
    eligibilityCriteria: 'Indian resident, gold ornaments as collateral', preApproved: false, featured: false
  },
  {
    bankName: 'Bank of Baroda', loanType: 'Gold Loan',
    minCreditScore: 500, maxCreditScore: 830, minMonthlyIncome: 8000,
    maxLoanAmount: 2000000, interestRate: 9.65, processingFee: 0.5,
    tenureMonths: 12, description: 'Bank of Baroda Gold Loan with competitive rates and easy processing.',
    features: ['Competitive rates', 'No hidden charges', 'Multiple repayment options'],
    eligibilityCriteria: 'Resident Indian, age 18+', preApproved: false, featured: false
  },
  {
    bankName: 'Bajaj Finance', loanType: 'Gold Loan',
    minCreditScore: 550, maxCreditScore: 850, minMonthlyIncome: 10000,
    maxLoanAmount: 10000000, interestRate: 9.50, processingFee: 1.0,
    tenureMonths: 36, description: 'Bajaj Finance Gold Loan with highest loan amount and multiple EMI options.',
    features: ['Highest loan amounts', 'Multiple EMI plans', 'Part release facility', 'Online management'],
    eligibilityCriteria: 'Age 21–70, gold 18 carat or above', preApproved: false, featured: false
  },
  {
    bankName: 'IndusInd Bank', loanType: 'Gold Loan',
    minCreditScore: 560, maxCreditScore: 850, minMonthlyIncome: 10000,
    maxLoanAmount: 5000000, interestRate: 10.75, processingFee: 1.5,
    tenureMonths: 24, description: 'IndusInd Bank Gold Loan with doorstep gold evaluation.',
    features: ['Doorstep evaluation', 'Quick approval', 'High LTV ratio', 'Multiple tenure options'],
    eligibilityCriteria: 'Age 21+, gold ornaments pledged', preApproved: false, featured: false
  },
  {
    bankName: 'Yes Bank', loanType: 'Gold Loan',
    minCreditScore: 550, maxCreditScore: 850, minMonthlyIncome: 10000,
    maxLoanAmount: 2000000, interestRate: 11.50, processingFee: 1.0,
    tenureMonths: 12, description: 'Yes Bank Gold Loan with quick digital approval and transparent pricing.',
    features: ['Digital application', 'Transparent pricing', 'Multiple repayment options'],
    eligibilityCriteria: 'Resident Indian, gold ornaments as security', preApproved: false, featured: false
  },
  {
    bankName: 'IDFC First Bank', loanType: 'Gold Loan',
    minCreditScore: 560, maxCreditScore: 850, minMonthlyIncome: 10000,
    maxLoanAmount: 1000000, interestRate: 10.75, processingFee: 0.5,
    tenureMonths: 12, description: 'IDFC First Bank Gold Loan with zero prepayment charges.',
    features: ['Zero foreclosure charges', 'Minimal documentation', 'Quick disbursal'],
    eligibilityCriteria: 'Indian resident, 18+ years', preApproved: false, featured: false
  },
  {
    bankName: 'Federal Bank', loanType: 'Gold Loan',
    minCreditScore: 530, maxCreditScore: 830, minMonthlyIncome: 8000,
    maxLoanAmount: 1000000, interestRate: 10.00, processingFee: 0.5,
    tenureMonths: 12, description: 'Federal Bank Gold Loan for NRIs and resident Indians.',
    features: ['NRI gold loan facility', 'Quick processing', 'Transparent pricing'],
    eligibilityCriteria: 'Resident Indian or NRI, age 18+', preApproved: false, featured: false
  },
  {
    bankName: 'Standard Chartered', loanType: 'Gold Loan',
    minCreditScore: 600, maxCreditScore: 850, minMonthlyIncome: 25000,
    maxLoanAmount: 10000000, interestRate: 11.00, processingFee: 1.5,
    tenureMonths: 24, description: 'Standard Chartered Gold Loan for premium customers with high collateral value.',
    features: ['Premium gold safe storage', 'High loan amounts', 'Global collateral management'],
    eligibilityCriteria: 'High net worth individuals, gold 22 carat+', preApproved: false, featured: false
  },
  {
    bankName: 'Canara Bank', loanType: 'Gold Loan',
    minCreditScore: 500, maxCreditScore: 820, minMonthlyIncome: 8000,
    maxLoanAmount: 1000000, interestRate: 9.75, processingFee: 0.25,
    tenureMonths: 12, description: 'Canara Bank Gold Loan with lowest processing charges and quick disbursal.',
    features: ['Lowest processing charge', 'Wide branch network', 'Bullet repayment option'],
    eligibilityCriteria: 'Indian resident, gold ornaments pledged', preApproved: false, featured: false
  },
  {
    bankName: 'Union Bank of India', loanType: 'Gold Loan',
    minCreditScore: 500, maxCreditScore: 820, minMonthlyIncome: 8000,
    maxLoanAmount: 1500000, interestRate: 9.60, processingFee: 0.5,
    tenureMonths: 12, description: 'Union Bank Gold Loan with affordable rates and flexible repayment.',
    features: ['Low rates', 'Flexible repayment', 'No prepayment charges', 'Digital application'],
    eligibilityCriteria: 'Indian resident, age 18+, gold ornaments', preApproved: false, featured: false
  }
];

// Mark all as active by default
const products = loanProducts.map(p => ({ ...p, isActive: true }));

const seedLoanProducts = async () => {
  try {
    console.log(`\n🔗 Connecting to: ${connUri.replace(/:\/\/[^@]+@/, '://***:***@')} ...\n`);
    await mongoose.connect(connUri);
    console.log('✅ Database connected.\n');

    // Clear existing
    const deleted = await LoanProduct.deleteMany({});
    console.log(`🗑️  Cleared ${deleted.deletedCount} existing loan products.\n`);

    // Insert all products
    const inserted = await LoanProduct.insertMany(products);
    console.log(`✅ Seeded ${inserted.length} loan products successfully!\n`);

    // Print Distribution Report
    const categoryMap = {};
    const bankMap = {};
    for (const p of inserted) {
      categoryMap[p.loanType] = (categoryMap[p.loanType] || 0) + 1;
      bankMap[p.bankName] = (bankMap[p.bankName] || 0) + 1;
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('              SEED DISTRIBUTION REPORT              ');
    console.log('═══════════════════════════════════════════════════');
    console.log(`📦 Total Products Seeded : ${inserted.length}`);
    console.log('');
    console.log('📂 By Category:');
    Object.entries(categoryMap).sort().forEach(([cat, cnt]) => {
      console.log(`   ${cat.padEnd(20)} : ${cnt} products`);
    });
    console.log('');
    console.log('🏦 By Bank:');
    Object.entries(bankMap).sort().forEach(([bank, cnt]) => {
      console.log(`   ${bank.padEnd(25)} : ${cnt} products`);
    });
    console.log('═══════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seedLoanProducts();
