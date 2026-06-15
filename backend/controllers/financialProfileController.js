import FinancialProfile from '../models/FinancialProfile.js';
import Lead from '../models/Lead.js';
import Client from '../models/Client.js';

// Helper to handle Mongoose validation errors nicely
const handleValidationError = (error, res) => {
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(val => val.message);
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: messages
    });
  }
  return res.status(500).json({
    status: 'error',
    message: error.message || 'Internal Server Error'
  });
};

// @desc    Create a new financial profile (Client only)
// @route   POST /api/financial-profile
// @access  Private (Client)
export const createProfile = async (req, res) => {
  try {
    // Check if user is a client
    if (req.user.role !== 'client') {
      return res.status(403).json({
        status: 'error',
        message: 'Only clients can create a financial profile.'
      });
    }

    // Check if profile already exists for this client
    const existingProfile = await FinancialProfile.findOne({ userId: req.user._id });
    if (existingProfile) {
      return res.status(400).json({
        status: 'error',
        message: 'Financial profile already exists for this account. Please update it instead.'
      });
    }

    // Extract fields from request body
    const {
      annualIncome,
      monthlyIncome,
      monthlyExpenses,
      savings,
      emergencyFund,
      creditScore,
      existingLoans,
      totalLoanAmount,
      monthlyEMI,
      businessName,
      businessType,
      annualRevenue,
      annualExpenses,
      yearsInBusiness,
      currentInvestments,
      riskTolerance,
      investmentGoals
    } = req.body;

    const profile = await FinancialProfile.create({
      userId: req.user._id,
      annualIncome,
      monthlyIncome,
      monthlyExpenses,
      savings,
      emergencyFund,
      creditScore,
      existingLoans,
      totalLoanAmount,
      monthlyEMI,
      businessName,
      businessType,
      annualRevenue,
      annualExpenses,
      yearsInBusiness,
      currentInvestments,
      riskTolerance,
      investmentGoals
    });

    res.status(201).json({
      status: 'success',
      message: 'Financial profile created successfully.',
      data: profile
    });

    // After responding, update the CRM lead score with real financial data
    try {
      const client = await Client.findById(req.user._id).select('email name phone');
      if (client) {
        let score = 5; // email
        if (client.phone) score += 10;
        if (annualIncome >= 1500000) score += 35;
        else if (annualIncome >= 600000) score += 20;
        else if (annualIncome > 0) score += 10;
        if (currentInvestments >= 10000000) score += 35;
        else if (currentInvestments >= 3000000) score += 20;
        else if (currentInvestments > 0) score += 10;
        if (investmentGoals?.length) score += 15;
        score = Math.min(100, score);
        const priority = score >= 65 ? 'hot' : score >= 35 ? 'warm' : 'cold';
        await Lead.findOneAndUpdate(
          { email: client.email, isActive: true },
          { score, priority, income: annualIncome || 0,
            status: 'interested',
            $push: { notes: { text: 'Financial assessment completed. Lead score updated.', addedBy: 'System' } }
          }
        );
      }
    } catch (e) { console.error('[createProfile] Lead score sync error:', e.message); }
  } catch (error) {
    handleValidationError(error, res);
  }
};

// @desc    Get the logged-in client's financial profile (Client only)
// @route   GET /api/financial-profile
// @access  Private (Client)
export const getMyProfile = async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({
        status: 'error',
        message: 'Only clients can access their own financial profile using this endpoint.'
      });
    }

    const profile = await FinancialProfile.findOne({ userId: req.user._id }).populate('assignedConsultant', 'name email phone department');
    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'No financial profile found for your account.'
      });
    }

    // If no assigned consultant on profile, check the Lead record
    if (!profile.assignedConsultant) {
      try {
        const client = await Client.findById(req.user._id).select('email');
        if (client) {
          const lead = await Lead.findOne({ email: client.email, isActive: true })
            .populate('assignedConsultant', 'name email phone department');
          if (lead?.assignedConsultant) {
            // Sync to profile for future calls
            await FinancialProfile.findByIdAndUpdate(profile._id, {
              assignedConsultant: lead.assignedConsultant._id
            });
            profile.assignedConsultant = lead.assignedConsultant;
          }
        }
      } catch (e) { /* non-fatal */ }
    }

    res.status(200).json({
      status: 'success',
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while fetching profile'
    });
  }
};

// @desc    Get a specific client's financial profile (Admin/Consultant)
// @route   GET /api/financial-profile/client/:clientId
// @access  Private (Admin/Consultant)
export const getProfileByClientId = async (req, res) => {
  try {
    const { clientId } = req.params;

    const profile = await FinancialProfile.findOne({ userId: clientId });
    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'No financial profile found for this client.'
      });
    }

    // Role-based access checks
    if (req.user.role === 'consultant') {
      // Consultant can only view if they are assigned to this client
      if (!profile.assignedConsultant || profile.assignedConsultant.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied: You are not assigned to this client\'s profile.'
        });
      }
    } else if (req.user.role !== 'admin') {
      // Any other non-admin role trying to access this specific endpoint is forbidden
      return res.status(403).json({
        status: 'error',
        message: 'Access denied: Unauthorized role.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while fetching client profile'
    });
  }
};

// @desc    Get all financial profiles (Admin only)
// @route   GET /api/financial-profile/all
// @access  Private (Admin)
export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await FinancialProfile.find().populate('userId', 'name email');
    res.status(200).json({
      status: 'success',
      results: profiles.length,
      data: profiles
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while fetching all profiles'
    });
  }
};

// @desc    Update the logged-in client's financial profile (Client only)
// @route   PUT /api/financial-profile
// @access  Private (Client)
export const updateMyProfile = async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({
        status: 'error',
        message: 'Only clients can update their financial profile.'
      });
    }

    const profile = await FinancialProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'No financial profile found to update. Please create one first.'
      });
    }

    // Exclude userId and assignedConsultant updates from client-side direct update for safety
    const updates = { ...req.body };
    delete updates.userId;
    delete updates.assignedConsultant;

    // Set new values and run schema validations
    profile.set(updates);
    await profile.save();

    res.status(200).json({
      status: 'success',
      message: 'Financial profile updated successfully.',
      data: profile
    });
  } catch (error) {
    handleValidationError(error, res);
  }
};

// @desc    Delete the logged-in client's financial profile (Client only)
// @route   DELETE /api/financial-profile
// @access  Private (Client)
export const deleteMyProfile = async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({
        status: 'error',
        message: 'Only clients can delete their own financial profile.'
      });
    }

    const profile = await FinancialProfile.findOneAndDelete({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'No financial profile found to delete.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Financial profile deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while deleting profile'
    });
  }
};

// @desc    Delete a specific client's financial profile (Admin only)
// @route   DELETE /api/financial-profile/client/:clientId
// @access  Private (Admin)
export const deleteProfileByClientId = async (req, res) => {
  try {
    const { clientId } = req.params;

    const profile = await FinancialProfile.findOneAndDelete({ userId: clientId });
    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'No financial profile found for this client.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Financial profile deleted successfully by administrator.'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while deleting client profile'
    });
  }
};
