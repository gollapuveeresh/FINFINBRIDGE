import express from 'express';
import Document from '../models/Document.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import FinancialProfile from '../models/FinancialProfile.js';
import Lead from '../models/Lead.js';

const router = express.Router();

// Client: get own documents
router.get('/my', protect, authorize('client'), async (req, res) => {
  try {
    const docs = await Document.find({ clientId: req.user._id }).sort({ createdAt: -1 });
    res.json({ status: 'success', documents: docs });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

// Client: upload document
router.post('/upload', protect, authorize('client'), async (req, res) => {
  try {
    const { name, type, size, department } = req.body;
    if (!name) return res.status(400).json({ status: 'error', message: 'Name required' });
    const doc = await Document.create({ clientId: req.user._id, name, type, size, department, status: 'Uploaded' });
    res.status(201).json({ status: 'success', document: doc });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

// Client: sign document
router.patch('/:id/sign', protect, authorize('client'), async (req, res) => {
  try {
    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, clientId: req.user._id },
      { status: 'Signed', canDownload: true },
      { new: true }
    );
    if (!doc) return res.status(404).json({ status: 'error', message: 'Document not found' });
    res.json({ status: 'success', document: doc });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

// Dept Admin: get documents for all clients in their department
router.get('/department', protect, authorize('department-admin'), async (req, res) => {
  try {
    const dept = req.user.department;
    // Find all won leads in this department to get clientIds
    const leads = await Lead.find({ department: dept, status: 'won', convertedClientId: { $ne: null } })
      .select('convertedClientId');
    const clientIds = leads.map(l => l.convertedClientId);
    const docs = await Document.find({ clientId: { $in: clientIds } })
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ status: 'success', documents: docs });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

// Consultant: get documents for their assigned clients
router.get('/consultant', protect, authorize('consultant'), async (req, res) => {
  try {
    // Find clients assigned to this consultant via FinancialProfile
    const profiles = await FinancialProfile.find({ assignedConsultant: req.user._id }).select('userId');
    const clientIds = profiles.map(p => p.userId);
    const docs = await Document.find({ clientId: { $in: clientIds } })
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ status: 'success', documents: docs });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

export default router;
