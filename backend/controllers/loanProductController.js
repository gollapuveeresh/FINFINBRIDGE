import mongoose from 'mongoose';
import crypto from 'crypto';
import LoanProduct from '../models/LoanProduct.js';
import RecommendationCache from '../models/RecommendationCache.js';
import RecommendationAudit from '../models/RecommendationAudit.js';
import FinancialProfile from '../models/FinancialProfile.js';
import Loan from '../models/Loan.js';

// Helper to determine credit score band
const getCreditBand = (score) => {
  if (score >= 750) return 'Excellent';
  if (score >= 700) return 'Good';
  if (score >= 650) return 'Fair';
  if (score >= 600) return 'Poor';
  return 'High Risk';
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get recommended loan products for the client
// @route   GET /api/loan-products/recommendations
// @access  Private (Client, Consultant, Admin)
// ─────────────────────────────────────────────────────────────────────────────
export const getLoanRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch user's financial profile
    const profile = await FinancialProfile.findOne({ userId });
    
    // Compile missing requirements
    const missingRequirements = [];
    if (!profile) {
      missingRequirements.push('No financial profile found. Please complete your profile wizard first.');
      return res.status(200).json({
        status: 'success',
        data: {
          totalMatches: 0,
          creditScore: 0,
          creditBand: 'High Risk',
          missingRequirements,
          highlyRecommended: [],
          recommended: [],
          considerLater: [],
          quickInsights: ['Please complete your financial profile to receive tailored recommendations.']
        }
      });
    }

    if (!profile.monthlyIncome || profile.monthlyIncome === 0) {
      missingRequirements.push('Monthly income information missing');
    }
    if (!profile.creditScore || profile.creditScore === 0) {
      missingRequirements.push('Credit score not available');
    }
    if (!profile.annualIncome || profile.annualIncome === 0) {
      // Auto-derive annualIncome from monthlyIncome if available (non-blocking)
      if (profile.monthlyIncome && profile.monthlyIncome > 0) {
        profile.annualIncome = profile.monthlyIncome * 12;
      } else {
        missingRequirements.push('Annual income information missing');
      }
    }

    // Category check for requested Business Loan
    let requestedType = req.query.loanType;
    if (requestedType) {
      const mapping = {
        'Personal': 'Personal Loan',
        'Home': 'Home Loan',
        'Car': 'Car Loan',
        'Education': 'Education Loan',
        'Business': 'Business Loan',
        'Gold': 'Gold Loan'
      };
      if (mapping[requestedType]) {
        requestedType = mapping[requestedType];
      }
      if (requestedType === 'Business Loan') {
        const hasBusinessProfile = profile.businessName || profile.businessType || profile.annualRevenue > 0;
        if (!hasBusinessProfile) {
          missingRequirements.push('Business profile required for business loans');
        }
      }
    }

    const creditBand = getCreditBand(profile.creditScore);

    // If critical profile fields are missing, return early
    if (missingRequirements.length > 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          totalMatches: 0,
          creditScore: profile.creditScore,
          creditBand,
          missingRequirements,
          highlyRecommended: [],
          recommended: [],
          considerLater: [],
          quickInsights: ['Complete the missing financial profile fields to view personalized recommendations.']
        }
      });
    }

    // 2. Compute profile hash for cache verification
    const goalsSorted = (profile.investmentGoals || []).slice().sort().join(',');
    const hashData = {
      creditScore: profile.creditScore || 0,
      monthlyIncome: profile.monthlyIncome || 0,
      monthlyExpenses: profile.monthlyExpenses || 0,
      monthlyEMI: profile.monthlyEMI || 0,
      investmentGoals: goalsSorted,
      businessName: profile.businessName || '',
      businessType: profile.businessType || '',
      annualRevenue: profile.annualRevenue || 0,
      annualExpenses: profile.annualExpenses || 0,
      yearsInBusiness: profile.yearsInBusiness || 0
    };
    const hashString = JSON.stringify(hashData);
    const profileHash = crypto.createHash('sha256').update(hashString).digest('hex');

    // 3. Cache Check (valid for 24 hours)
    const cached = await RecommendationCache.findOne({
      userId,
      profileHash,
      expiresAt: { $gt: new Date() }
    });

    if (cached) {
      let responseData = cached.recommendations;
      
      // If loanType filter query is provided, filter the cached list on the fly
      if (requestedType) {
        responseData = {
          totalMatches: responseData.totalMatches,
          creditScore: responseData.creditScore,
          creditBand: responseData.creditBand,
          missingRequirements: responseData.missingRequirements,
          highlyRecommended: responseData.highlyRecommended.filter(r => r.loanType === requestedType),
          recommended: responseData.recommended.filter(r => r.loanType === requestedType),
          considerLater: responseData.considerLater.filter(r => r.loanType === requestedType),
          quickInsights: responseData.quickInsights
        };
      }
      return res.status(200).json({
        status: 'success',
        data: responseData
      });
    }

    // 4. Calculate available income and DTI
    const monthlyIncome = profile.monthlyIncome || 1; // prevent div by zero
    const monthlyExpenses = profile.monthlyExpenses || 0;
    const monthlyEMI = profile.monthlyEMI || 0;
    const availableIncome = monthlyIncome - monthlyExpenses - monthlyEMI;
    const dti = monthlyEMI / monthlyIncome;

    // Hard Rule: Negative available income or DTI > 0.6 means NO recommendations are possible
    if (availableIncome <= 0 || dti > 0.6) {
      const emptyData = {
        totalMatches: 0,
        creditScore: profile.creditScore,
        creditBand,
        missingRequirements: availableIncome <= 0 
          ? ['Your current living expenses and EMIs exceed your monthly income.'] 
          : ['Your Debt-To-Income (DTI) ratio is higher than 60%, blocking further borrowing.'],
        highlyRecommended: [],
        recommended: [],
        considerLater: [],
        quickInsights: ['Consider lowering monthly expenses or paying off current outstanding loans to recover borrowing power.']
      };

      // Store in cache for 24h
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await RecommendationCache.findOneAndUpdate(
        { userId },
        { profileHash, creditScore: profile.creditScore, recommendations: emptyData, expiresAt },
        { upsert: true, new: true }
      );

      // Audit Trail
      await RecommendationAudit.create({
        userId,
        creditBand,
        creditScore: profile.creditScore,
        dti,
        activeLoanCount: 0,
        topRecommendation: null,
        recommendationCount: 0
      });

      return res.status(200).json({
        status: 'success',
        data: emptyData
      });
    }

    // 5. Query active loans for Active Loan Count Penalty
    const activeLoanCount = await Loan.countDocuments({
      userId,
      isActive: true,
      status: 'Active'
    });

    let loanCountPenalty = 0;
    if (activeLoanCount >= 5) {
      loanCountPenalty = 25;
    } else if (activeLoanCount >= 3) {
      loanCountPenalty = 10;
    }

    // 6. Fetch active loan products
    const productsFilter = { isActive: true };
    const dbProducts = await LoanProduct.find(productsFilter);

    const allMatches = [];
    const maximumAffordableEMI = monthlyIncome * 0.4;

    for (const loan of dbProducts) {
      // Hard Filters: minCreditScore and minMonthlyIncome
      if (profile.creditScore < loan.minCreditScore || monthlyIncome < loan.minMonthlyIncome) {
        continue;
      }

      // Hard Eligibility Constraints by Category
      if (loan.loanType === 'Home Loan') {
        if (monthlyIncome < 50000) continue;
      } else if (loan.loanType === 'Car Loan') {
        if (monthlyIncome < 25000) continue;
      } else if (loan.loanType === 'Business Loan') {
        const hasBusinessProfile = profile.businessName || profile.businessType || profile.annualRevenue > 0;
        if (!hasBusinessProfile) continue;
      } else if (loan.loanType === 'Education Loan') {
        const hasEduGoal = (profile.investmentGoals || []).some(g => 
          /education|studies|study|child/i.test(g)
        );
        if (!hasEduGoal) continue;
      }

      // Step 1: Calculate Category-Specific Eligible Loan Amount
      let multiplier = 12; // default personal
      if (loan.loanType === 'Home Loan') multiplier = 80;
      else if (loan.loanType === 'Car Loan') multiplier = 20;
      else if (loan.loanType === 'Education Loan') multiplier = 30;
      else if (loan.loanType === 'Business Loan') multiplier = 40;
      else if (loan.loanType === 'Gold Loan') multiplier = 8;

      const eligibleLoanAmount = Math.round(Math.min(loan.maxLoanAmount, monthlyIncome * multiplier));

      // Step 2: Calculate EMI
      const R = loan.interestRate / 12 / 100;
      const N = loan.tenureMonths;
      let estimatedEMI = 0;
      if (R > 0) {
        estimatedEMI = Math.round(eligibleLoanAmount * (R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1));
      } else {
        estimatedEMI = Math.round(eligibleLoanAmount / N);
      }

      // Step 3: Affordability Scoring & Boosts/Penalties
      let emiAffordabilityBoost = -20;
      if (estimatedEMI <= maximumAffordableEMI) {
        emiAffordabilityBoost = 15;
      }

      const creditRange = 850 - loan.minCreditScore;
      const creditDiff = profile.creditScore - loan.minCreditScore;
      const creditComponent = creditRange > 0 ? Math.min(60, (creditDiff / creditRange) * 60) : 60;

      const incomeRatio = monthlyIncome / Math.max(1, loan.minMonthlyIncome);
      const incomeComponent = Math.min(40, (incomeRatio - 1) * 20);

      // Intent Goals Boost
      let intentBoost = 0;
      if (loan.loanType === 'Home Loan') {
        const longTermMatch = (profile.investmentGoals || []).some(g =>
          /retirement|wealth|home|property|long term/i.test(g)
        );
        if (longTermMatch) intentBoost += 15;
      } else if (loan.loanType === 'Education Loan') {
        intentBoost += 15;
      } else if (loan.loanType === 'Business Loan') {
        intentBoost += 15;
      }

      let eligibilityScore = creditComponent + incomeComponent + intentBoost + emiAffordabilityBoost - loanCountPenalty;

      // Apply DTI penalty (Score reduced by 20% if DTI is 0.4 - 0.6)
      if (dti >= 0.4 && dti <= 0.6) {
        eligibilityScore *= 0.8;
      }

      // Affordability Ratio Multiplier
      const affordabilityRatio = availableIncome / monthlyIncome;
      const adjustedScore = parseFloat(Math.max(0, eligibilityScore * affordabilityRatio).toFixed(2));

      const isEligible = adjustedScore >= 60;
      const recommendationConfidence = Math.round(Math.min(100, adjustedScore));

      // Dynamic Explanation Engine
      const recommendationExplanation = [
        `Credit score exceeds minimum requirement by ${Math.round(creditDiff)} points`,
        `Monthly income of ₹${profile.monthlyIncome.toLocaleString('en-IN')} exceeds lender minimum requirement of ₹${loan.minMonthlyIncome.toLocaleString('en-IN')}`
      ];

      if (dti < 0.4) {
        recommendationExplanation.push(`Current DTI ratio is healthy (${(dti * 100).toFixed(1)}%)`);
      } else {
        recommendationExplanation.push(`Debt-to-Income obligations are moderate (${(dti * 100).toFixed(1)}%)`);
      }

      if (estimatedEMI <= maximumAffordableEMI) {
        recommendationExplanation.push(`Estimated EMI of ₹${estimatedEMI.toLocaleString('en-IN')} is affordable (${Math.round((estimatedEMI / maximumAffordableEMI) * 100)}% of allowable budget)`);
      } else {
        recommendationExplanation.push(`Estimated EMI of ₹${estimatedEMI.toLocaleString('en-IN')} exceeds your comfortable monthly limit`);
      }

      if (intentBoost > 0) {
        recommendationExplanation.push(`Matches your financial goals: ${profile.investmentGoals.join(', ')}`);
      }

      allMatches.push({
        _id: loan._id,
        bankName: loan.bankName,
        loanType: loan.loanType,
        interestRate: loan.interestRate,
        processingFee: loan.processingFee,
        tenureMonths: loan.tenureMonths,
        maxLoanAmount: loan.maxLoanAmount,
        description: loan.description,
        features: loan.features,
        bankLogo: loan.bankLogo,
        officialWebsite: loan.officialWebsite,
        preApproved: loan.preApproved,
        featured: loan.featured,
        eligibleLoanAmount,
        estimatedEMI,
        affordabilityRatio: parseFloat(affordabilityRatio.toFixed(2)),
        adjustedScore,
        isEligible,
        recommendationConfidence,
        recommendationExplanation
      });
    }

    // Sort: AdjustedScore DESC, interestRate ASC
    allMatches.sort((a, b) => {
      if (b.adjustedScore !== a.adjustedScore) {
        return b.adjustedScore - a.adjustedScore;
      }
      return a.interestRate - b.interestRate;
    });

    const totalMatches = allMatches.length;

    // Slice top 10
    const top10 = allMatches.slice(0, 10);

    // Group into Tiers
    const highlyRecommended = top10.filter(p => p.adjustedScore >= 80);
    const recommended = top10.filter(p => p.adjustedScore >= 60 && p.adjustedScore < 80);
    const considerLater = top10.filter(p => p.adjustedScore < 60);

    // Dynamic Quick Insights Engine
    const quickInsights = [];
    if (profile.creditScore >= 750) {
      quickInsights.push('Your credit profile qualifies for premium lending products.');
    }
    if (profile.monthlyEMI > profile.monthlyIncome * 0.3) {
      quickInsights.push('Reducing EMI obligations may unlock better offers.');
    }
    const isHomeLoanLimited = allMatches.some(m => m.loanType === 'Home Loan' && m.eligibleLoanAmount < m.maxLoanAmount);
    if (isHomeLoanLimited) {
      quickInsights.push('Home loans are currently limited by monthly income.');
    }
    if (quickInsights.length === 0) {
      quickInsights.push('You have a stable borrowing profile with multiple active options.');
    }

    const finalRecommendations = {
      totalMatches,
      creditScore: profile.creditScore,
      creditBand,
      missingRequirements,
      highlyRecommended,
      recommended,
      considerLater,
      quickInsights
    };

    // 7. Write to cache with 24 hours expiry
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await RecommendationCache.findOneAndUpdate(
      { userId },
      { profileHash, creditScore: profile.creditScore, recommendations: finalRecommendations, expiresAt },
      { upsert: true, new: true }
    );

    // 8. Write audit record
    const topRecommendation = highlyRecommended[0] || recommended[0] || considerLater[0] || null;
    await RecommendationAudit.create({
      userId,
      creditBand,
      creditScore: profile.creditScore,
      dti,
      activeLoanCount,
      topRecommendation,
      recommendationCount: totalMatches
    });

    // Handle Category Filter on fresh return
    let filteredData = { ...finalRecommendations };
    if (requestedType) {
      filteredData = {
        totalMatches: finalRecommendations.totalMatches,
        creditScore: finalRecommendations.creditScore,
        creditBand: finalRecommendations.creditBand,
        missingRequirements: finalRecommendations.missingRequirements,
        highlyRecommended: finalRecommendations.highlyRecommended.filter(r => r.loanType === requestedType),
        recommended: finalRecommendations.recommended.filter(r => r.loanType === requestedType),
        considerLater: finalRecommendations.considerLater.filter(r => r.loanType === requestedType),
        quickInsights: finalRecommendations.quickInsights
      };
    }

    res.status(200).json({
      status: 'success',
      data: filteredData
    });

  } catch (error) {
    console.error('[getLoanRecommendations] Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Server error while generating recommendations'
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get loan products analytics (Admin only)
// @route   GET /api/loan-products/analytics
// @access  Private (Admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const getLoanProductAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Access denied: Admin only.' });
    }

    const totalProducts = await LoanProduct.countDocuments();
    const activeProducts = await LoanProduct.countDocuments({ isActive: true });
    const inactiveProducts = await LoanProduct.countDocuments({ isActive: false });

    // Category distribution
    const categoryAgg = await LoanProduct.aggregate([
      { $group: { _id: '$loanType', count: { $sum: 1 } } }
    ]);
    const productsByCategory = {};
    categoryAgg.forEach(item => {
      productsByCategory[item._id] = item.count;
    });

    // Bank distribution
    const bankAgg = await LoanProduct.aggregate([
      { $group: { _id: '$bankName', count: { $sum: 1 } } }
    ]);
    const productsByBank = {};
    bankAgg.forEach(item => {
      productsByBank[item._id] = item.count;
    });

    // Average interest rate
    const avgRateAgg = await LoanProduct.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avgRate: { $avg: '$interestRate' } } }
    ]);
    const averageInterestRate = avgRateAgg[0] ? parseFloat(avgRateAgg[0].avgRate.toFixed(2)) : 0;

    res.status(200).json({
      status: 'success',
      data: {
        totalProducts,
        activeProducts,
        inactiveProducts,
        averageInterestRate,
        productsByCategory,
        productsByBank
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message || 'Analytics fetch error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new loan product (Admin only)
// @route   POST /api/loan-products
// @access  Private (Admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const createLoanProduct = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Access denied: Admin only.' });
    }

    const product = await LoanProduct.create(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Loan product created successfully.',
      data: product
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ status: 'error', message: error.message });
    }
    res.status(500).json({ status: 'error', message: error.message || 'Server error creating product' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all loan products (Admin only)
// @route   GET /api/loan-products
// @access  Private (Admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const getLoanProducts = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Access denied: Admin only.' });
    }

    const products = await LoanProduct.find().sort({ bankName: 1, loanType: 1 });
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error loading products' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single loan product by ID (Admin only)
// @route   GET /api/loan-products/:id
// @access  Private (Admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const getLoanProductById = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Access denied: Admin only.' });
    }

    const product = await LoanProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Loan product not found.' });
    }

    res.status(200).json({
      status: 'success',
      data: product
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error loading product detail' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update loan product parameters (Admin only)
// @route   PUT /api/loan-products/:id
// @access  Private (Admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const updateLoanProduct = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Access denied: Admin only.' });
    }

    const product = await LoanProduct.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Loan product not found.' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Loan product updated successfully.',
      data: product
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error updating product' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Soft delete a loan product (Admin only)
// @route   DELETE /api/loan-products/:id
// @access  Private (Admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteLoanProduct = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Access denied: Admin only.' });
    }

    const product = await LoanProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Loan product not found.' });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    res.status(200).json({
      status: 'success',
      message: 'Loan product soft deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error soft deleting product' });
  }
};
