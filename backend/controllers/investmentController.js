import mongoose from 'mongoose';
import Investment from '../models/Investment.js';
import InvestmentHistory from '../models/InvestmentHistory.js';
import FinancialProfile from '../models/FinancialProfile.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Recalculate Portfolio Values & Upsert Daily Snapshot
// ─────────────────────────────────────────────────────────────────────────────
export const syncInvestmentPortfolio = async (userId) => {
  try {
    // 1. Calculate sums of active investments
    const result = await Investment.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(String(userId)),
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalPortfolioValue: { $sum: '$currentValue' }
        }
      }
    ]);

    const totalPortfolioValue = result[0]?.totalPortfolioValue || 0;

    // 2. Update FinancialProfile summary cache
    await FinancialProfile.findOneAndUpdate(
      { userId },
      { currentInvestments: totalPortfolioValue },
      { new: true, runValidators: true }
    );

    // 3. Upsert today's snapshot to prevent duplicates (only 1 record per user per day)
    const todayStr = new Date().toISOString().split('T')[0];

    await InvestmentHistory.findOneAndUpdate(
      { userId, recordedDate: todayStr },
      { portfolioValue: totalPortfolioValue },
      { upsert: true, new: true, runValidators: true }
    );

  } catch (error) {
    console.error('[syncInvestmentPortfolio] Sync error:', error.message);
  }
};

// Helper to check access permissions for a specific client's data
const verifyClientAccess = async (req, clientId) => {
  const currentUserId = req.user._id.toString();
  const currentUserRole = req.user.role;

  if (currentUserRole === 'admin') {
    return true;
  }

  if (currentUserRole === 'client') {
    return currentUserId === clientId.toString();
  }

  if (currentUserRole === 'consultant') {
    // Consultant can access only assigned clients
    const profile = await FinancialProfile.findOne({ userId: clientId });
    return (
      profile &&
      profile.assignedConsultant &&
      profile.assignedConsultant.toString() === currentUserId
    );
  }

  return false;
};

// Helper: Validation error handler
const handleValidationError = (error, res) => {
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(val => val.message);
    return res.status(400).json({ status: 'error', message: 'Validation failed', errors: messages });
  }
  return res.status(500).json({ status: 'error', message: error.message || 'Internal Server Error' });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new investment record
// @route   POST /api/investments
// @access  Private (Client or Admin)
// ─────────────────────────────────────────────────────────────────────────────
export const createInvestment = async (req, res) => {
  try {
    const {
      userId,
      investmentType,
      amountInvested,
      currentValue,
      purchaseDate,
      riskLevel,
      notes
    } = req.body;

    // Resolve target client based on role
    let targetUserId = req.user._id;
    if (req.user.role === 'admin') {
      if (!userId) {
        return res.status(400).json({ status: 'error', message: 'Client User ID is required for administrative creation.' });
      }
      targetUserId = userId;
    } else if (req.user.role !== 'client') {
      return res.status(403).json({ status: 'error', message: 'Access denied: Unauthorized role.' });
    }

    // Rule: FinancialProfile must exist before investments
    const profile = await FinancialProfile.findOne({ userId: targetUserId });
    if (!profile) {
      return res.status(400).json({
        status: 'error',
        message: 'A financial profile is required before registering investments. Please complete your profile wizard first.'
      });
    }

    const investment = await Investment.create({
      userId: targetUserId,
      investmentType,
      amountInvested,
      currentValue,
      purchaseDate,
      riskLevel,
      notes,
      isActive: true
    });

    // Synchronize profile and daily snapshot
    await syncInvestmentPortfolio(targetUserId);

    res.status(201).json({
      status: 'success',
      message: 'Investment record created successfully.',
      data: investment
    });
  } catch (error) {
    handleValidationError(error, res);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all active investments
// @route   GET /api/investments
// @access  Private (Client, Consultant, Admin)
// ─────────────────────────────────────────────────────────────────────────────
export const getInvestments = async (req, res) => {
  try {
    let filter = { isActive: true };

    if (req.user.role === 'client') {
      filter.userId = req.user._id;
    } else if (req.user.role === 'consultant') {
      const assignedProfiles = await FinancialProfile.find(
        { assignedConsultant: req.user._id },
        { userId: 1 }
      );
      const clientIds = assignedProfiles.map(p => p.userId);
      filter.userId = { $in: clientIds };
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Access denied.' });
    }

    const investments = await Investment.find(filter).sort({ purchaseDate: -1 });

    res.status(200).json({
      status: 'success',
      results: investments.length,
      data: investments
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error fetching investments' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single investment by ID
// @route   GET /api/investments/:id
// @access  Private (Client, Consultant, Admin)
// ─────────────────────────────────────────────────────────────────────────────
export const getInvestmentById = async (req, res) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, isActive: true });
    if (!investment) {
      return res.status(404).json({ status: 'error', message: 'Investment record not found.' });
    }

    const hasAccess = await verifyClientAccess(req, investment.userId);
    if (!hasAccess) {
      return res.status(403).json({ status: 'error', message: 'Access denied: Unauthorized to view this record.' });
    }

    res.status(200).json({ status: 'success', data: investment });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error fetching investment details' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update investment specifications
// @route   PUT /api/investments/:id
// @access  Private (Client or Admin)
// ─────────────────────────────────────────────────────────────────────────────
export const updateInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, isActive: true });
    if (!investment) {
      return res.status(404).json({ status: 'error', message: 'Investment record not found.' });
    }

    const hasAccess = await verifyClientAccess(req, investment.userId);
    if (!hasAccess || (req.user.role === 'consultant')) {
      return res.status(403).json({ status: 'error', message: 'Access denied: Unauthorized to edit this record.' });
    }

    const updates = { ...req.body };
    delete updates.userId;
    delete updates.isActive;

    Object.assign(investment, updates);
    await investment.save();

    // Synchronize totals
    await syncInvestmentPortfolio(investment.userId);

    res.status(200).json({
      status: 'success',
      message: 'Investment record updated successfully.',
      data: investment
    });
  } catch (error) {
    handleValidationError(error, res);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Soft delete an investment
// @route   DELETE /api/investments/:id
// @access  Private (Client or Admin)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, isActive: true });
    if (!investment) {
      return res.status(404).json({ status: 'error', message: 'Investment record not found.' });
    }

    const hasAccess = await verifyClientAccess(req, investment.userId);
    if (!hasAccess || (req.user.role === 'consultant')) {
      return res.status(403).json({ status: 'error', message: 'Access denied: Unauthorized to delete this record.' });
    }

    const targetUserId = investment.userId;

    investment.isActive = false;
    await investment.save();

    // Synchronize totals
    await syncInvestmentPortfolio(targetUserId);

    res.status(200).json({
      status: 'success',
      message: 'Investment record deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error deleting investment' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get aggregated investment portfolio summary
// @route   GET /api/investments/summary
// @access  Private (Client, Consultant, Admin)
// ─────────────────────────────────────────────────────────────────────────────
export const getInvestmentSummary = async (req, res) => {
  try {
    let targetUserId = req.user._id;

    if (req.user.role === 'admin' || req.user.role === 'consultant') {
      const queryUserId = req.query.userId;
      if (queryUserId) {
        targetUserId = queryUserId;
      }
    }

    const hasAccess = await verifyClientAccess(req, targetUserId);
    if (!hasAccess) {
      return res.status(403).json({ status: 'error', message: 'Access denied: Unauthorized.' });
    }

    const activeList = await Investment.find({ userId: targetUserId, isActive: true });
    const inactiveCount = await Investment.countDocuments({ userId: targetUserId, isActive: false });

    const totalInvestments = activeList.length;
    const activeInvestments = activeList.length;

    let totalPortfolioValue = 0;
    let totalAmountInvested = 0;

    // Allocate totals per category type
    const categoryTotals = {};

    activeList.forEach(inv => {
      totalPortfolioValue += inv.currentValue;
      totalAmountInvested += inv.amountInvested;
      categoryTotals[inv.investmentType] = (categoryTotals[inv.investmentType] || 0) + inv.currentValue;
    });

    const totalProfitLoss = totalPortfolioValue - totalAmountInvested;
    const overallROI = totalAmountInvested > 0 ? ((totalProfitLoss / totalAmountInvested) * 100) : 0;

    // Asset allocation percentages (safe from division by zero)
    const allocation = {};
    if (totalPortfolioValue > 0) {
      Object.keys(categoryTotals).forEach(type => {
        allocation[type] = parseFloat(((categoryTotals[type] / totalPortfolioValue) * 100).toFixed(2));
      });
    }

    // Diversification score
    const categoryCount = Object.keys(categoryTotals).length;
    let diversificationScore = 'No Investments Yet';
    if (categoryCount === 1) {
      diversificationScore = 'Poor Diversification';
    } else if (categoryCount >= 2 && categoryCount <= 3) {
      diversificationScore = 'Moderate Diversification';
    } else if (categoryCount >= 4) {
      diversificationScore = 'Well Diversified';
    }

    res.status(200).json({
      status: 'success',
      data: {
        totalPortfolioValue,
        totalAmountInvested,
        totalProfitLoss,
        overallROI: parseFloat(overallROI.toFixed(2)),
        totalInvestments,
        activeInvestments,
        inactiveInvestments: inactiveCount,
        diversificationScore,
        allocation
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error loading summary metrics' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get portfolio value history snapshots
// @route   GET /api/investments/history
// @access  Private (Client, Consultant, Admin)
// ─────────────────────────────────────────────────────────────────────────────
export const getInvestmentHistory = async (req, res) => {
  try {
    let targetUserId = req.user._id;

    if (req.user.role === 'admin' || req.user.role === 'consultant') {
      const queryUserId = req.query.userId;
      if (queryUserId) {
        targetUserId = queryUserId;
      }
    }

    const hasAccess = await verifyClientAccess(req, targetUserId);
    if (!hasAccess) {
      return res.status(403).json({ status: 'error', message: 'Access denied: Unauthorized.' });
    }

    // Sorted chronological ascending order (recordedDate)
    const history = await InvestmentHistory.find({ userId: targetUserId })
      .sort({ recordedDate: 1 })
      .select('recordedDate portfolioValue -_id');

    res.status(200).json({
      status: 'success',
      results: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error loading history snapshots' });
  }
};
