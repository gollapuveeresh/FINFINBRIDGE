import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword,
  verifyEmail
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import Consultant from '../models/Consultant.js';
import Client from '../models/Client.js';
import Admin from '../models/Admin.js';

import { validate } from '../validators/validateMiddleware.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);

// Protected routes
router.get('/me', protect, getMe);

// Super Admin: list admins by role/department
router.get('/admins', protect, authorize('admin'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.department) {
      // handle legacy 'investments' value stored in old records
      const dept = req.query.department;
      filter.department = dept === 'investment' ? { $in: ['investment', 'investments'] } : dept;
    }
    const admins = await Admin.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ status: 'success', admins });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Super Admin: create any admin user (crm-admin, department-admin) with hashed password
router.post('/create-admin', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role, department, phone } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ status: 'error', message: 'name, email, password and role are required' });
    }
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(409).json({ status: 'error', message: 'Email already exists' });

    const user = await Admin.create({
      name, email, password, role, department: department || 'crm',
      phone, companyName: 'FinBridge Solutions Inc', isActive: true, isEmailVerified: true
    });
    res.status(201).json({ status: 'success', message: 'Admin created successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Super Admin: update admin (toggle active etc)
router.patch('/admins/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { isActive, name, phone } = req.body;
    const updates = {};
    if (isActive !== undefined) updates.isActive = isActive;
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    const admin = await Admin.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!admin) return res.status(404).json({ status: 'error', message: 'Admin not found' });
    res.json({ status: 'success', admin });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Super Admin: delete admin
router.delete('/admins/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ status: 'success', message: 'Admin deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Super Admin or Dept Admin: create consultant
router.post('/create-consultant', protect, authorize('admin', 'department-admin'), async (req, res) => {
  try {
    const { name, email, password, department, phone } = req.body;
    if (!name || !email || !password || !department) {
      return res.status(400).json({ status: 'error', message: 'name, email, password and department are required' });
    }
    const exists = await Consultant.findOne({ email });
    if (exists) return res.status(409).json({ status: 'error', message: 'Email already exists' });
    const consultant = await Consultant.create({
      name, email, password, department, phone,
      companyName: 'FinBridge Advisory', isActive: true, isEmailVerified: true
    });
    res.status(201).json({ status: 'success', message: 'Consultant created', consultant: { id: consultant._id, name: consultant.name, email: consultant.email, department: consultant.department } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Super Admin or Dept Admin: update consultant
router.patch('/consultants/:id', protect, authorize('admin', 'department-admin'), async (req, res) => {
  try {
    const { isActive, name, phone } = req.body;
    const updates = {};
    if (isActive !== undefined) updates.isActive = isActive;
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    const consultant = await Consultant.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!consultant) return res.status(404).json({ status: 'error', message: 'Consultant not found' });
    res.json({ status: 'success', consultant });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Super Admin or Dept Admin: delete consultant
router.delete('/consultants/:id', protect, authorize('admin', 'department-admin'), async (req, res) => {
  try {
    await Consultant.findByIdAndDelete(req.params.id);
    res.json({ status: 'success', message: 'Consultant deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// List all consultants (for lead assignment + admin dashboard)
router.get('/consultants', protect, authorize('admin', 'department-admin', 'crm-admin'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.department) {
      const dept = req.query.department;
      filter.department = dept === 'investment' ? { $in: ['investment', 'investments'] } : dept;
    }
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    const consultants = await Consultant.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ status: 'success', consultants });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Super Admin: list all clients
router.get('/clients', protect, authorize('admin', 'crm-admin'), async (req, res) => {
  try {
    const clients = await Client.find().select('-password').sort({ createdAt: -1 });
    res.json({ status: 'success', clients });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// List clients assigned to this consultant via FinancialProfile.assignedConsultant
router.get('/consultant/clients', protect, authorize('consultant'), async (req, res) => {
  try {
    const FinancialProfile = (await import('../models/FinancialProfile.js')).default;
    const profiles = await FinancialProfile.find({ assignedConsultant: req.user._id }).select('userId');
    const clientIds = profiles.map(p => p.userId);
    const clients = await Client.find({ _id: { $in: clientIds }, isActive: true }).select('name email phone');
    res.json({ status: 'success', clients });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;
