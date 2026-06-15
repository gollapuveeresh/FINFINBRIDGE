import mongoose from 'mongoose';
import Loan from '../models/Loan.js';
import FinancialProfile from '../models/FinancialProfile.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Recalculate FinancialProfile totals using MongoDB aggregation
// Rules:
//   • Only loans where isActive: true (not soft-deleted)
//   • Only loans where status is NOT 'Closed'
//   • totalLoanAmount = sum(outstandingBalance)
//   • monthlyEMI      = sum(monthlyEMI)
// ─────────────────────────────────────────────────────────────────────────────
export const recalculateProfileSummary = async (userId) => {
  try {
    const result = await Loan.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(String(userId)),
          isActive: true,
          status: { $ne: 'Closed' }
        }
      },
      {
        $group: {
          _id: null,
          totalLoanAmount: { $sum: '$outstandingBalance' },
          monthlyEMI: { $sum: '$monthlyEMI' }
        }
      }
    ]);

    const totalLoanAmount = result[0]?.totalLoanAmount || 0;
    const monthlyEMI = result[0]?.monthlyEMI || 0;

    // Update FinancialProfile summary — never store duplicate loan details
    await FinancialProfile.findOneAndUpdate(
      { userId },
      {
        totalLoanAmount,
        monthlyEMI,
        existingLoans: []  // Clear embedded loan list; loans collection is source of truth
      },
      { new: true, runValidators: true }
    );
  } catch (error) {
    console.error('[recalculateProfileSummary] Error:', error.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Validation error formatter
// ─────────────────────────────────────────────────────────────────────────────
const handleValidationError = (error, res) => {
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(val => val.message);
    return res.status(400).json({ status: 'error', message: 'Validation failed', errors: messages });
  }
  return res.status(500).json({ status: 'error', message: error.message || 'Internal Server Error' });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new loan record
// @route   POST /api/loans
// @access  Private (Client or Admin)
// ─────────────────────────────────────────────────────────────────────────────
export const createLoan = async (req, res) => {
  try {
    const {
      userId,
      loanType,
      lenderName,
      principalAmount,
      outstandingBalance,
      interestRate,
      tenureMonths,
      monthlyEMI,
      startDate,
      endDate,
      status,
      notes
    } = req.body;

    // Resolve target userId based on role
    let targetUserId = req.user._id;
    if (req.user.role === 'admin') {
      if (!userId) {
        return res.status(400).json({
          status: 'error',
          message: 'Client User ID is required for administrative loan creation.'
        });
      }
      targetUserId = userId;
    } else if (req.user.role !== 'client') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied: Only clients or administrators can create loan records.'
      });
    }

    // RULE: FinancialProfile must exist before loan creation
    const profile = await FinancialProfile.findOne({ userId: targetUserId });
    if (!profile) {
      return res.status(400).json({
        status: 'error',
        message: 'A financial profile is required before creating a loan. Please complete your Financial Health Profile wizard first.'
      });
    }

    // Auto-generate loanNumber (LN-000001, LN-000002, ...)
    // Sort descending by loanNumber to find the highest existing number
    const lastLoan = await Loan.findOne().sort({ loanNumber: -1 }).select('loanNumber');
    let nextNum = 1;
    if (lastLoan?.loanNumber) {
      const match = lastLoan.loanNumber.match(/^LN-(\d+)$/);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }
    const loanNumber = `LN-${String(nextNum).padStart(6, '0')}`;

    // Create loan
    const loan = await Loan.create({
      userId: targetUserId,
      loanNumber,
      loanType,
      lenderName,
      principalAmount,
      outstandingBalance,
      interestRate,
      tenureMonths,
      monthlyEMI,
      startDate,
      endDate,
      status,
      notes,
      isActive: true
    });

    // Sync FinancialProfile totals
    await recalculateProfileSummary(targetUserId);

    res.status(201).json({
      status: 'success',
      message: 'Loan record created successfully.',
      data: loan
    });
  } catch (error) {
    handleValidationError(error, res);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all loans (role-filtered, soft-deleted excluded)
// @route   GET /api/loans
// @access  Private (Client, Consultant, Admin)
// ─────────────────────────────────────────────────────────────────────────────
export const getLoans = async (req, res) => {
  try {
    // Base filter: only active (not soft-deleted) loans
    let filter = { isActive: true };

    if (req.user.role === 'client') {
      filter.userId = req.user._id;
    } else if (req.user.role === 'consultant') {
      // Consultant sees only assigned clients' loans
      const assignedProfiles = await FinancialProfile.find(
        { assignedConsultant: req.user._id },
        { userId: 1 }
      );
      const clientIds = assignedProfiles.map(p => p.userId);
      filter.userId = { $in: clientIds };
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Access denied: Unauthorized role.' });
    }
    // Admin: filter stays as { isActive: true } — sees all non-deleted loans

    const loans = await Loan.find(filter)
      .populate({ path: 'userId', model: 'Client', select: 'name email phone' })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: loans.length,
      data: loans
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error fetching loans' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get a single loan by ID (soft-deleted excluded)
// @route   GET /api/loans/:id
// @access  Private (Client, Consultant, Admin)
// ─────────────────────────────────────────────────────────────────────────────
export const getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, isActive: true })
      .populate({ path: 'userId', model: 'Client', select: 'name email phone' });

    if (!loan) {
      return res.status(404).json({ status: 'error', message: 'Loan record not found.' });
    }

    // Role-based access check
    if (req.user.role === 'client') {
      const ownerId = loan.userId?._id?.toString() || loan.userId?.toString();
      if (ownerId !== req.user._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied: You cannot view other clients\' loan records.'
        });
      }
    } else if (req.user.role === 'consultant') {
      const clientId = loan.userId?._id?.toString() || loan.userId?.toString();
      const profile = await FinancialProfile.findOne({ userId: clientId });
      if (!profile || profile.assignedConsultant?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied: You are not assigned to this client.'
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Access denied: Unauthorized role.' });
    }

    res.status(200).json({ status: 'success', data: loan });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error fetching loan details' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update a loan record
// @route   PUT /api/loans/:id
// @access  Private (Client or Admin)
// ─────────────────────────────────────────────────────────────────────────────
export const updateLoan = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, isActive: true });

    if (!loan) {
      return res.status(404).json({ status: 'error', message: 'Loan record not found.' });
    }

    // Access check
    if (req.user.role === 'client') {
      if (loan.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied: You cannot update other clients\' loan records.'
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Access denied: Unauthorized role.' });
    }

    const updates = { ...req.body };
    // Protect immutable fields
    delete updates.userId;
    delete updates.loanNumber;
    delete updates.isActive;

    Object.assign(loan, updates);
    await loan.save();

    // Sync FinancialProfile totals
    await recalculateProfileSummary(loan.userId);

    res.status(200).json({
      status: 'success',
      message: 'Loan record updated successfully.',
      data: loan
    });
  } catch (error) {
    handleValidationError(error, res);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Soft delete a loan (sets isActive: false, preserves record in DB)
// @route   DELETE /api/loans/:id
// @access  Private (Client or Admin)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteLoan = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, isActive: true });

    if (!loan) {
      return res.status(404).json({ status: 'error', message: 'Loan record not found.' });
    }

    // Access check
    if (req.user.role === 'client') {
      if (loan.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied: You cannot delete other clients\' loan records.'
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Access denied: Unauthorized role.' });
    }

    const targetUserId = loan.userId;

    // Soft delete — preserve record in DB, just mark as inactive
    loan.isActive = false;
    await loan.save();

    // Sync FinancialProfile totals (soft-deleted loan is now excluded from sums)
    await recalculateProfileSummary(targetUserId);

    res.status(200).json({
      status: 'success',
      message: 'Loan record deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error deleting loan' });
  }
};
