import Lead from '../models/Lead.js';
import Client from '../models/Client.js';
import Consultant from '../models/Consultant.js';
import Notification from '../models/Notification.js';

// Auto-map serviceType to department
const inferDepartment = (serviceType) => {
  if (!serviceType) return null;
  const s = serviceType.toLowerCase();
  if (s.includes('loan') || s.includes('mortgage') || s.includes('emi')) return 'loans';
  if (s.includes('tax') || s.includes('itr') || s.includes('gst') || s.includes('it return') || s.includes('filing')) return 'tax';
  if (s.includes('mutual') || s.includes('sip') || s.includes('stock') || s.includes('equity') || s.includes('invest') || s.includes('portfolio') || s.includes('retirement planning')) return 'investment';
  if (s.includes('insurance') || s.includes('policy') || s.includes('health') || s.includes('life') || s.includes('motor')) return 'insurance';
  if (s.includes('wealth') || s.includes('hni') || s.includes('estate') || s.includes('asset') || s.includes('family wealth')) return 'wealth';
  return null;
};

// Score a lead based on income, budget, requirement
const scoreLead = (lead) => {
  let score = 0;
  if (lead.income >= 1500000) score += 35;
  else if (lead.income >= 600000) score += 20;
  else if (lead.income > 0) score += 10;

  if (lead.budget >= 10000000) score += 35;
  else if (lead.budget >= 3000000) score += 20;
  else if (lead.budget > 0) score += 10;

  if (lead.requirement) score += 15;
  if (lead.phone) score += 10;
  if (lead.email) score += 5;

  const priority = score >= 65 ? 'hot' : score >= 35 ? 'warm' : 'cold';
  return { score, priority };
};

// POST /api/leads — create lead (public or CRM)
export const createLead = async (req, res) => {
  try {
    const { name, email, phone, income, requirement, budget, source, serviceType, department } = req.body;
    if (!name || !email) return res.status(400).json({ status: 'error', message: 'Name and email are required' });

    const existing = await Lead.findOne({ email, status: { $nin: ['lost', 'rejected', 'won'] } });
    if (existing) return res.status(409).json({ status: 'error', message: 'Active lead already exists for this email' });

    const raw = { name, email, phone, income: income || 0, requirement, budget: budget || 0, source, serviceType, department: department || inferDepartment(serviceType) };
    const { score, priority } = scoreLead(raw);
    const lead = await Lead.create({ ...raw, score, priority });

    res.status(201).json({ status: 'success', lead });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/leads — list all leads (CRM / admin)
export const getLeads = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.source) filter.source = req.query.source;
    if (req.user.role === 'consultant') filter.assignedConsultant = req.user._id;

    const leads = await Lead.find(filter)
      .populate('assignedConsultant', 'name email department')
      .populate('assignedAdmin', 'name email department')
      .sort({ createdAt: -1 });
    res.json({ status: 'success', count: leads.length, leads });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/leads/:id
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedConsultant', 'name email department')
      .populate('assignedAdmin', 'name email department')
      .populate('convertedClientId', 'name email');
    if (!lead) return res.status(404).json({ status: 'error', message: 'Lead not found' });
    res.json({ status: 'success', lead });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/leads/:id — update status, score, assignment, department
export const updateLead = async (req, res) => {
  try {
    const allowed = ['status', 'priority', 'score', 'department', 'serviceType', 'assignedConsultant', 'assignedAdmin', 'crmOwner', 'followUpDate', 'lastContactedAt', 'tags'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const lead = await Lead.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('assignedConsultant', 'name email department');
    if (!lead) return res.status(404).json({ status: 'error', message: 'Lead not found' });

    // Notify consultant if assigned
    if (updates.assignedConsultant) {
      await Notification.create({
        userId: updates.assignedConsultant,
        userModel: 'Consultant',
        type: 'lead_assigned',
        title: 'New Lead Assigned',
        message: `Lead ${lead.leadId} (${lead.name}) has been assigned to you.`,
        metadata: { leadId: lead._id }
      });

      // If lead already converted, sync consultant onto the client's FinancialProfile
      if (lead.convertedClientId) {
        const FinancialProfile = (await import('../models/FinancialProfile.js')).default;
        await FinancialProfile.findOneAndUpdate(
          { userId: lead.convertedClientId },
          { $setOnInsert: { userId: lead.convertedClientId }, $set: { assignedConsultant: updates.assignedConsultant } },
          { upsert: true, new: true }
        );
      }
    }

    res.json({ status: 'success', lead });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/leads/:id/note — add note to lead
export const addLeadNote = async (req, res) => {
  try {
    const { text } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: { text, addedBy: req.user?.name || 'System' } } },
      { new: true }
    );
    if (!lead) return res.status(404).json({ status: 'error', message: 'Lead not found' });
    res.json({ status: 'success', lead });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/leads/:id/convert — convert lead to client
export const convertLeadToClient = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedConsultant', 'name email');
    if (!lead) return res.status(404).json({ status: 'error', message: 'Lead not found' });
    if (lead.status === 'won') return res.status(400).json({ status: 'error', message: 'Lead already converted' });

    const isNewClient = !(await Client.findOne({ email: lead.email }));
    let client = await Client.findOne({ email: lead.email });

    // Generate temp password for new accounts
    const tempPassword = Math.random().toString(36).slice(-8) + 'Fb1!';

    if (!client) {
      client = await Client.create({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        password: tempPassword,
        isEmailVerified: true
      });
    }

    // Sync assignedConsultant onto FinancialProfile (create stub if needed)
    if (lead.assignedConsultant) {
      const FinancialProfile = (await import('../models/FinancialProfile.js')).default;
      await FinancialProfile.findOneAndUpdate(
        { userId: client._id },
        { $setOnInsert: { userId: client._id }, $set: { assignedConsultant: lead.assignedConsultant._id } },
        { upsert: true, new: true }
      );
    }

    await Lead.findByIdAndUpdate(lead._id, { status: 'won', convertedClientId: client._id });

    // Notify client via in-app notification
    await Notification.create({
      userId: client._id,
      userModel: 'Client',
      type: 'onboarding',
      title: 'Welcome to FinBridge!',
      message: `Your account has been activated. ${lead.assignedConsultant ? `Your advisor is ${lead.assignedConsultant.name}.` : ''} Log in to access your dashboard.`,
      metadata: { leadId: lead._id }
    });

    // Send welcome email with credentials if new account was created
    if (isNewClient) {
      try {
        const { default: sendEmail } = await import('../utils/sendEmail.js');
        await sendEmail({
          to: client.email,
          subject: 'Your FinBridge Account is Ready',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
              <h2 style="color:#0d6efd">Welcome to FinBridge, ${client.name}!</h2>
              <p>Your client account has been created. You can now log in to your portal.</p>
              <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:20px 0">
                <p><strong>Login URL:</strong> <a href="http://localhost:5173/client/login">http://localhost:5173/client/login</a></p>
                <p><strong>Email:</strong> ${client.email}</p>
                <p><strong>Temporary Password:</strong> ${tempPassword}</p>
              </div>
              ${lead.assignedConsultant ? `<p>Your assigned advisor is <strong>${lead.assignedConsultant.name}</strong> (${lead.assignedConsultant.email}).</p>` : ''}
              <p style="color:#888;font-size:12px">Please change your password after first login.</p>
            </div>
          `
        });
      } catch (mailErr) {
        console.error('[convertLeadToClient] Email error:', mailErr.message);
      }
    }

    res.json({
      status: 'success',
      message: 'Lead converted to client',
      clientId: client._id,
      client,
      isNewClient,
      tempPassword: isNewClient ? tempPassword : undefined
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/leads/stats — pipeline analytics
export const getLeadStats = async (req, res) => {
  try {
    const statuses = ['new', 'contacted', 'interested', 'qualified', 'rejected', 'lost', 'assigned', 'consultation', 'proposal', 'won'];
    const stats = await Promise.all(statuses.map(async s => ({
      status: s,
      count: await Lead.countDocuments({ status: s, isActive: true })
    })));

    const bySource = await Lead.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);

    const byDepartment = await Lead.aggregate([
      { $match: { isActive: true, department: { $ne: null } } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    const byPriority = await Lead.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.json({ status: 'success', pipeline: stats, bySource, byDepartment, byPriority });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// DELETE /api/leads/:id — soft delete
export const deleteLead = async (req, res) => {
  try {
    await Lead.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ status: 'success', message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
