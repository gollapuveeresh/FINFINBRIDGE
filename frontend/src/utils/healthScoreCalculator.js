/**
 * Shared utility for calculating Client Financial Health Score and ratios
 */

export function calculateHealthScore(profile) {
  if (!profile) return 0;
  let score = 0;
  
  // 1. Savings/Liquidity (Max 25 pts)
  const monthlyExpenses = profile.monthlyExpenses || 0;
  const emergencyFund = profile.emergencyFund || 0;
  if (monthlyExpenses > 0) {
    const monthsCovered = emergencyFund / monthlyExpenses;
    if (monthsCovered >= 6) score += 25;
    else if (monthsCovered >= 3) score += 18;
    else if (monthsCovered >= 1) score += 10;
    else score += 5;
  } else {
    score += 20;
  }

  // 2. Debt Service (Max 25 pts)
  const monthlyIncome = profile.monthlyIncome || (profile.annualIncome ? profile.annualIncome / 12 : 0);
  const monthlyEMI = profile.monthlyEMI || 0;
  if (monthlyEMI === 0) {
    score += 25;
  } else if (monthlyIncome > 0) {
    const dti = (monthlyEMI / monthlyIncome) * 100;
    if (dti <= 20) score += 20;
    else if (dti <= 36) score += 15;
    else if (dti <= 50) score += 10;
    else score += 5;
  } else {
    score += 5;
  }

  // 3. Credit Standing (Max 25 pts)
  const creditScore = profile.creditScore || 600;
  if (creditScore >= 750) score += 25;
  else if (creditScore >= 700) score += 20;
  else if (creditScore >= 650) score += 15;
  else if (creditScore >= 600) score += 10;
  else score += 5;

  // 4. Investment & Wealth (Max 25 pts)
  const currentInvestments = profile.currentInvestments || 0;
  const investmentGoals = profile.investmentGoals || [];
  if (currentInvestments > 100000) score += 15;
  else if (currentInvestments > 10000) score += 10;
  else if (currentInvestments > 0) score += 5;

  if (investmentGoals.length >= 3) score += 10;
  else if (investmentGoals.length > 0) score += 5;

  return score;
}

export function getHealthMetrics(profile, summaryData = null) {
  if (!profile) {
    return {
      score: 0,
      monthsCovered: 0,
      dti: 0,
      savingsRate: 0,
      creditScore: 600,
      investmentScore: 30,
      liquidityPillarScore: 30,
      debtPillarScore: 30,
      savingsPillarScore: 30,
      investmentPillarScore: 30,
      liquidityPillarStatus: 'Needs Work',
      debtPillarStatus: 'Needs Work',
      savingsPillarStatus: 'Needs Work',
      investmentPillarStatus: 'Needs Work',
      overallStanding: 'Profile Not Completed',
      overallRisk: 'High Risk'
    };
  }

  let score = calculateHealthScore(profile);

  // Apply diversification boost (+5 Poor, +10 Moderate, +15 Well Diversified; capped at 100)
  let diversificationBoost = 0;
  if (summaryData && summaryData.diversificationScore) {
    const ds = summaryData.diversificationScore;
    if (ds === 'Poor Diversification') {
      diversificationBoost = 5;
    } else if (ds === 'Moderate Diversification') {
      diversificationBoost = 10;
    } else if (ds === 'Well Diversified') {
      diversificationBoost = 15;
    }
  }
  score = Math.min(100, score + diversificationBoost);

  const monthlyExpenses = profile.monthlyExpenses || 0;
  const emergencyFund = profile.emergencyFund || 0;
  const monthsCovered = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;

  const monthlyIncome = profile.monthlyIncome || (profile.annualIncome ? profile.annualIncome / 12 : 0);
  const monthlyEMI = profile.monthlyEMI || 0;
  const dti = monthlyIncome > 0 ? (monthlyEMI / monthlyIncome) * 100 : 0;

  const annualIncome = profile.annualIncome || 0;
  const savings = profile.savings || 0;
  const savingsRate = annualIncome > 0 ? (savings / annualIncome) * 100 : 0;

  const currentInvestments = profile.currentInvestments || 0;

  // Liquidity Pillar Score
  const liquidityPillarScore = Math.min(100, Math.max(30, Math.round(monthsCovered * 16.6)));
  const liquidityPillarStatus = liquidityPillarScore >= 85 ? 'Strong' : liquidityPillarScore >= 70 ? 'Moderate' : 'Needs Work';

  // Debt Pillar Score
  const debtPillarScore = monthlyEMI === 0 ? 100 : Math.max(30, Math.round(100 - dti * 1.5));
  const debtPillarStatus = debtPillarScore >= 85 ? 'Optimal' : debtPillarScore >= 70 ? 'Healthy' : 'Needs Work';

  // Savings Pillar Score
  const savingsPillarScore = Math.min(100, Math.max(30, Math.round(savingsRate * 4)));
  const savingsPillarStatus = savingsPillarScore >= 85 ? 'Strong' : savingsPillarScore >= 70 ? 'Moderate' : 'Needs Work';

  // Investment Pillar Score (also used for investment score)
  const investmentPillarScore = Math.min(100, Math.max(30, Math.round((currentInvestments / 150000) * 100)));
  const investmentPillarStatus = investmentPillarScore >= 85 ? 'Strong' : investmentPillarScore >= 70 ? 'Moderate' : 'Needs Work';

  const overallStanding = score >= 85 ? 'Excellent Standing' : score >= 70 ? 'Good Standing' : 'Needs Optimization';
  const overallRisk = score >= 85 ? 'Low Risk Profile' : score >= 70 ? 'Moderate Risk' : 'High Risk';

  return {
    score,
    monthsCovered,
    dti,
    savingsRate,
    creditScore: profile.creditScore || 600,
    investmentScore: investmentPillarScore,
    liquidityPillarScore,
    debtPillarScore,
    savingsPillarScore,
    investmentPillarScore,
    liquidityPillarStatus,
    debtPillarStatus,
    savingsPillarStatus,
    investmentPillarStatus,
    overallStanding,
    overallRisk,
    diversificationBoost
  };
}
