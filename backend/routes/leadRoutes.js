import express from 'express';
import {
  createLead, getLeads, getLeadById, updateLead,
  addLeadNote, convertLeadToClient, getLeadStats, deleteLead
} from '../controllers/leadController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import Lead from '../models/Lead.js';
import Admin from '../models/Admin.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Public lead capture (from website form)
router.post('/capture', createLead);

// Stats
router.get('/stats', protect, authorize('admin', 'department-admin', 'crm-admin'), getLeadStats);

// Full CRUD
router.get('/', protect, authorize('admin', 'department-admin', 'crm-admin', 'consultant'), getLeads);
router.post('/', protect, authorize('admin', 'department-admin', 'crm-admin'), createLead);
router.get('/:id', protect, authorize('admin', 'department-admin', 'crm-admin', 'consultant'), getLeadById);
router.patch('/:id', protect, authorize('admin', 'department-admin', 'crm-admin'), updateLead);
router.post('/:id/note', protect, authorize('admin', 'department-admin', 'crm-admin', 'consultant'), addLeadNote);
router.post('/:id/convert', protect, authorize('admin', 'department-admin', 'crm-admin'), convertLeadToClient);
router.delete('/:id', protect, authorize('admin', 'crm-admin'), deleteLead);

// POST /api/leads/:id/send-to-department
// CRM Admin qualifies lead and sends it to the correct department admin
router.post('/:id/send-to-department', protect, authorize('admin', 'crm-admin'), async (req, res) => {
  try {
    const { department, notes } = req.body;
    if (!department) return res.status(400).json({ status: 'error', message: 'Department is required' });

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        department,
        status: 'qualified',
        assignedAdmin: req.user._id,
        lastContactedAt: new Date(),
        ...(notes ? { $push: { notes: { text: `[CRM → ${department.toUpperCase()}] ${notes}`, addedBy: req.user?.name || 'CRM Admin' } } } : {})
      },
      { new: true }
    ).populate('assignedConsultant', 'name email');
    if (!lead) return res.status(404).json({ status: 'error', message: 'Lead not found' });

    // Find all dept admins of this department and notify them
    const deptAdmins = await Admin.find({ role: 'department-admin', department, isActive: true });
    await Promise.all(deptAdmins.map(admin =>
      Notification.create({
        userId: admin._id,
        userModel: 'Admin',
        type: 'lead_received',
        title: 'New Lead from CRM',
        message: `Lead ${lead.leadId} (${lead.name}) has been routed to your ${department} department by CRM team.`,
        metadata: { leadId: lead._id }
      })
    ));

    res.json({ status: 'success', message: `Lead sent to ${department} department`, lead });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;
