export const loans = [
  { id: 'LN-20241001', type: 'Business Term Loan', amount: '$250,000', balance: '$182,500', rate: '7.5%', next: '$4,250', status: 'Active', due: 'Nov 01, 2024' },
  { id: 'LN-20240815', type: 'Commercial Real Estate', amount: '$1,200,000', balance: '$1,080,000', rate: '6.2%', next: '$7,100', status: 'Active', due: 'Nov 15, 2024' },
  { id: 'LN-20231201', type: 'Equipment Financing', amount: '$85,000', balance: '$12,400', rate: '8.1%', next: '$1,850', status: 'Closing Soon', due: 'Jan 01, 2025' },
  { id: 'LN-20220601', type: 'Working Capital Line', amount: '$500,000', balance: '$0', rate: '9.0%', next: '$0', status: 'Closed', due: 'Paid Off' },
];

export const loanSummary = {
  totalOutstanding: '$1,274,900',
  monthlyPaymentsDue: '$13,200',
  averageRate: '7.2% APR'
};

export const loanRecommendations = [
  {
    id: 'rec-1',
    title: 'Commercial Mortgage Refinance',
    icon: 'home_work',
    rate: '5.40% APR',
    prevRate: '6.20%',
    type: 'Fixed Rate',
    term: '15 Years',
    maxAmount: '$1,200,000',
    estSavings: '$9,600 / Year',
    description: 'Designed specifically to refinance active loan LN-20240815. Lower interest and extend term for monthly savings.',
    badge: 'Highly Recommended',
    badgeClass: 'bg-success/15 text-success',
    rawRate: 5.40,
  },
  {
    id: 'rec-2',
    title: 'Business Term Loan',
    icon: 'business_center',
    rate: '6.80% APR',
    prevRate: 'N/A',
    type: 'Fixed Rate',
    term: '5 Years',
    maxAmount: '$500,000',
    estSavings: 'Immediate Capital',
    description: 'Secured working capital for corporate expansion, asset procurement, or operational scalability.',
    badge: 'Pre-Approved Offer',
    badgeClass: 'bg-secondary/15 text-secondary',
    rawRate: 6.80,
  },
  {
    id: 'rec-3',
    title: 'Portfolio Asset Leverage (ABLOC)',
    icon: 'account_balance',
    rate: '5.95% APR',
    prevRate: 'N/A',
    type: 'Variable (SOFR + 1.2%)',
    term: 'Interest-Only Flex',
    maxAmount: '$900,000',
    estSavings: 'Liquidity Safeguard',
    description: 'Leverage your $1.28M investment holdings for immediate cash flow. No tax trigger from asset sales.',
    badge: 'Hedge Liquidity',
    badgeClass: 'bg-accent-fixed-dim/20 text-accent',
    rawRate: 5.95,
  },
];

export const loanMatrix = [
  {
    name: 'Commercial Refinance',
    rate: '5.40% Fixed',
    fee: '0.75% of Principal',
    collateral: 'Commercial Property Lien',
    penalty: 'None (Prepay Allowed)',
    repayment: 'Standard Amortization'
  },
  {
    name: 'Business Term Loan',
    rate: '6.80% Fixed',
    fee: '1.00% of Principal',
    collateral: 'Corporate Assets UCC-1',
    penalty: '1.5% in Year 1, 0% after',
    repayment: 'Monthly Debits'
  },
  {
    name: 'Asset Portfolio ABLOC',
    rate: '5.95% Variable',
    fee: '0.25% Setup Fee',
    collateral: 'Brokerage Account Assets',
    penalty: 'None',
    repayment: 'Interest Only, Draw-As-Needed'
  }
];
