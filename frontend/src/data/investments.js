export const portfolioOverview = {
  totalValue: '$1,280,000',
  monthlyChange: '+$62,400 (5.12%) this month',
  monthlyPositive: true,
  allocations: [
    { color: 'bg-accent', label: 'US Equities', pct: '40%', val: '$512K' },
    { color: 'bg-secondary', label: 'Intl. Bonds', pct: '25%', val: '$320K' },
    { color: 'bg-accent-fixed-dim', label: 'Real Estate', pct: '20%', val: '$256K' },
    { color: 'bg-success', label: 'Alternatives', pct: '15%', val: '$192K' },
  ]
};

export const holdings = [
  { ticker: 'AAPL', name: 'Apple Inc.', price: '$189.30', shares: '350', value: '$66,255', day: '+$2.40 (1.3%)', total: '+$18,750 (39.5%)', pos: true },
  { ticker: 'MSFT', name: 'Microsoft Corp.', price: '$415.20', shares: '180', value: '$74,736', day: '+$1.80 (0.4%)', total: '+$28,620 (61.9%)', pos: true },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', price: '$168.50', shares: '290', value: '$48,865', day: '-$3.20 (-1.9%)', total: '+$12,400 (34.0%)', pos: false },
  { ticker: 'BRK.B', name: 'Berkshire Hathaway', price: '$374.10', shares: '100', value: '$37,410', day: '+$0.60 (0.2%)', total: '+$5,620 (17.7%)', pos: true },
  { ticker: 'VNQ', name: 'Vanguard REIT ETF', price: '$82.40', shares: '800', value: '$65,920', day: '-$1.10 (-1.3%)', total: '+$7,840 (13.5%)', pos: false },
];

export const investmentRecommendations = [
  {
    id: 'rec-1',
    title: 'Technology & AI Sector Tilt',
    category: 'US Equities',
    risk: 'High',
    return: '9.8% - 12.4% Est.',
    icon: 'memory',
    badge: 'Trending Sector',
    badgeClass: 'bg-accent/15 text-accent',
    desc: 'Increase weighting in leading generative AI infrastructure and semiconductor holdings. Reallocate 5% from cash equivalents.',
  },
  {
    id: 'rec-2',
    title: 'Short-Duration Treasury Bond Ladder',
    category: 'Fixed Income',
    risk: 'Low',
    return: '5.2% Yield',
    icon: 'shield',
    badge: 'Capital Preservation',
    badgeClass: 'bg-success/15 text-success',
    desc: 'Lock in yields with a customized 3-to-18 month short-term US Treasury ladder. Protect capital from interest rate fluctuations.',
  },
  {
    id: 'rec-3',
    title: 'Global Infrastructure Fund',
    category: 'Alternatives',
    risk: 'Medium',
    return: '7.5% + Yield',
    icon: 'location_city',
    badge: 'Inflation Hedge',
    badgeClass: 'bg-secondary/15 text-secondary',
    desc: 'Broad exposure to worldwide logistics hubs, utilities, and green energy infrastructure. Excellent correlation hedge against equities.',
  }
];
