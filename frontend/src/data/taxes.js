export const taxSummary = {
  estimatedLiabilities: '$18,450',
  paidYTD: '$12,000',
  remainingPayments: '$6,450',
  currentBracket: '32.0%',
  filingStatus: 'Filing Separately',
  deductionsEstimated: '$14,200',
};

export const quarterlyPayments = [
  { quarter: 'Q1 2026', due: 'April 15, 2026', amount: '$4,000', status: 'Paid', method: 'EFTPS Direct Debit', date: 'April 12, 2026' },
  { quarter: 'Q2 2026', due: 'June 15, 2026', amount: '$4,000', status: 'Paid', method: 'EFTPS Direct Debit', date: 'June 14, 2026' },
  { quarter: 'Q3 2026', due: 'Sept 15, 2026', amount: '$4,000', status: 'Paid', method: 'EFTPS Direct Debit', date: 'Sept 10, 2026' },
  { quarter: 'Q4 2026', due: 'Jan 15, 2027', amount: '$6,450', status: 'Pending', method: 'Pending Action', date: '—' },
];

export const taxDeductions = [
  { category: 'Home Office Deduction', type: 'Standard Itemized', maxAllowed: '$3,200', currentSaved: '$2,850', status: 'Verified' },
  { category: 'Charitable Donations', type: 'Cash Receipts', maxAllowed: '$5,000', currentSaved: '$4,150', status: 'Verified' },
  { category: 'Retirement Contributions', type: 'SEP IRA Plan', maxAllowed: '$16,000', currentSaved: '$16,000', status: 'Maxed Out' },
  { category: 'Business Equipment (Sec 179)', type: 'Depreciation Lift', maxAllowed: '$25,000', currentSaved: '$12,400', status: 'Reviewing' },
];

export const taxDocuments = [
  { year: '2025', form: 'Form 1040 (Filing Copy)', size: '2.4 MB', date: 'April 10, 2026', status: 'Filing Complete' },
  { year: '2025', form: 'Schedule K-1 (FinBridge LP)', size: '1.8 MB', date: 'March 28, 2026', status: 'Ready' },
  { year: '2025', form: 'Form 1099-DIV (Brokerage)', size: '850 KB', date: 'Feb 15, 2026', status: 'Ready' },
  { year: '2025', form: 'Form 1098 (Mortgage Interest)', size: '420 KB', date: 'Jan 31, 2026', status: 'Ready' },
];
