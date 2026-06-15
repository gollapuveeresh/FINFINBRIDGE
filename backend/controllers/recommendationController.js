import Recommendation from '../models/Recommendation.js';

// GET all recommendations (drafts + sent) for the logged-in consultant
export const getRecommendations = async (req, res) => {
  try {
    const recs = await Recommendation.find({ consultantId: req.user._id }).sort({ updatedAt: -1 });
    res.status(200).json({ status: 'success', data: recs });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// CREATE a new draft recommendation
export const createRecommendation = async (req, res) => {
  try {
    const { clientName, productCategory, details, status } = req.body;
    if (!clientName || !productCategory || !details) {
      return res.status(400).json({
        status: 'error',
        message: 'clientName, productCategory and details are required',
      });
    }

    const rec = await Recommendation.create({
      consultantId: req.user._id,
      clientName,
      productCategory,
      details,
      status: status || 'draft',
    });
    res.status(201).json({ status: 'success', data: rec });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// DELETE a recommendation
export const deleteRecommendation = async (req, res) => {
  try {
    await Recommendation.findOneAndDelete({
      _id: req.params.id,
      consultantId: req.user._id,
    });
    res.status(200).json({ status: 'success', message: 'Recommendation deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
