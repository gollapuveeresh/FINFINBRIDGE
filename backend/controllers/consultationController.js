import Consultation from '../models/Consultation.js';
import Notification from '../models/Notification.js';
import Consultant from '../models/Consultant.js';
import Admin from '../models/Admin.js';
import sendEmail from '../utils/sendEmail.js';

const DEPARTMENTS = ['loans', 'tax', 'investment', 'insurance', 'wealth'];

// Some Admin/Consultant records use the legacy plural 'investments' for the investment department
const deptMatch = (department) => (department === 'investment' ? { $in: ['investment', 'investments'] } : department);
const normalizeDept = (department) => (department === 'investments' ? 'investment' : department);

// @desc    Book a new consultation (Client only)
// @route   POST /api/consultations
// @access  Private (Client)
export const createConsultation = async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({
        status: 'error',
        message: 'Only clients can book a consultation.'
      });
    }

    const { category, clientNotes, department } = req.body;
    if (!category) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a category for the consultation.'
      });
    }

    // Department is optional — infer from category if not provided
    const inferDept = (cat) => {
      const c = cat.toLowerCase();
      if (c.includes('loan') || c.includes('emi') || c.includes('mortgage')) return 'loans';
      if (c.includes('tax') || c.includes('itr') || c.includes('gst')) return 'tax';
      if (c.includes('invest') || c.includes('sip') || c.includes('portfolio') || c.includes('retirement')) return 'investment';
      if (c.includes('insurance') || c.includes('policy') || c.includes('health') || c.includes('life')) return 'insurance';
      if (c.includes('wealth') || c.includes('estate') || c.includes('hni')) return 'wealth';
      return 'loans'; // safe default
    };
    const resolvedDept = (department && DEPARTMENTS.includes(department)) ? department : inferDept(category);

    // Create the consultation - unassigned, pending department admin allocation
    const consultation = await Consultation.create({
      clientId: req.user._id,
      consultantId: null,
      department: resolvedDept,
      category,
      clientNotes: clientNotes || '',
      status: 'pending'
    });

    // Notify all department admins for this department
    const deptAdmins = await Admin.find({ role: 'department-admin', department: deptMatch(resolvedDept), isActive: true });
    await Promise.all(deptAdmins.map(admin =>
      Notification.create({
        userId: admin._id,
        userModel: 'Admin',
        type: 'consultation_request',
        title: 'New Consultation Request',
        message: `${req.user.name} has requested a ${category} consultation. Please assign a consultant.`,
        metadata: { consultationId: consultation._id, department: resolvedDept }
      })
    ));

    // Also notify consultants in that department directly
    const deptConsultants = await Consultant.find({ department: deptMatch(resolvedDept), isActive: true });
    await Promise.all(deptConsultants.map(c =>
      Notification.create({
        userId: c._id,
        userModel: 'Consultant',
        type: 'consultation_request',
        title: 'New Consultation Request',
        message: `${req.user.name} has requested a ${category} consultation in ${resolvedDept} department.`,
        metadata: { consultationId: consultation._id }
      })
    ));

    // Also link the assigned consultant from FinancialProfile if exists
    try {
      const FinancialProfile = (await import('../models/FinancialProfile.js')).default;
      const fp = await FinancialProfile.findOne({ userId: req.user._id }).select('assignedConsultant');
      if (fp?.assignedConsultant) {
        await Consultation.findByIdAndUpdate(consultation._id, { consultantId: fp.assignedConsultant });
        // Notify that specific consultant
        await Notification.create({
          userId: fp.assignedConsultant,
          userModel: 'Consultant',
          type: 'consultation_request',
          title: 'Consultation Booked by Your Client',
          message: `${req.user.name} has booked a ${category} consultation with you.`,
          metadata: { consultationId: consultation._id }
        });
      }
    } catch (e) { console.error('[createConsultation] FP consultant link error:', e.message); }

    // Create a notification for the client
    await Notification.create({
      userId: req.user._id,
      userModel: 'Client',
      type: 'consultation',
      title: 'Consultation Requested',
      message: `Your request for a ${category} consultation has been received and is pending assignment by the department admin.`
    });

    // Send confirmation email to the client (defensively wrapped in try-catch)
    try {
      await sendEmail({
        to: req.user.email,
        subject: 'Consultation Request Received - FinBridge',
        text: `Dear ${req.user.name},\n\nWe have received your request for a ${category} consultation. Our department team will review your request and assign an advisor shortly.\n\nThank you,\nFinBridge Solutions`,
        html: `<p>Dear <strong>${req.user.name}</strong>,</p><p>We have received your request for a <strong>${category}</strong> consultation. Our department team will review your request and assign an advisor shortly.</p><br/><p>Thank you,<br/>FinBridge Solutions</p>`
      });
    } catch (mailErr) {
      console.error('Error sending booking emails:', mailErr.message);
    }

    res.status(201).json({
      status: 'success',
      message: 'Your consultation request has been received and is pending assignment.',
      data: consultation
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while booking consultation'
    });
  }
};

// @desc    Get all consultations scoped by user role (Client, Consultant, Admin)
// @route   GET /api/consultations
// @access  Private
export const getConsultations = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'client') {
      query.clientId = req.user._id;
    } else if (req.user.role === 'consultant') {
      query.consultantId = req.user._id;
    } else if (req.user.role === 'department-admin') {
      query.department = normalizeDept(req.user.department);
    }

    const consultations = await Consultation.find(query)
      .populate('clientId', 'name email phone companyName')
      .populate('consultantId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: consultations
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while fetching consultations'
    });
  }
};

// @desc    Accept and schedule a consultation (Consultant only)
// @route   PATCH /api/consultations/:id/accept
// @access  Private (Consultant)
export const acceptConsultation = async (req, res) => {
  try {
    if (req.user.role !== 'consultant') {
      return res.status(403).json({
        status: 'error',
        message: 'Only consultants can accept consultations.'
      });
    }

    const { id } = req.params;
    const { confirmedDate, confirmedTime } = req.body;

    if (!confirmedDate || !confirmedTime) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide both confirmed date and confirmed time.'
      });
    }

    const consultation = await Consultation.findById(id).populate('clientId', 'name email');
    if (!consultation) {
      return res.status(404).json({
        status: 'error',
        message: 'Consultation not found.'
      });
    }

    // Verify ownership
    if (consultation.consultantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only accept consultations assigned to you.'
      });
    }

    consultation.status = 'accepted';
    consultation.confirmedDate = confirmedDate;
    consultation.confirmedTime = confirmedTime;
    consultation.meetingLink = 'https://zoom.us/j/' + Math.floor(1000000000 + Math.random() * 9000000000);
    await consultation.save();

    // Create a notification for the client
    await Notification.create({
      recipientId: consultation.clientId._id || consultation.clientId,
      recipientModel: 'Client',
      type: 'consultation',
      title: 'Consultation Confirmed',
      message: `Your consultation request has been accepted for ${confirmedDate} at ${confirmedTime}.`
    });

    // Create a notification for the consultant (advisor)
    await Notification.create({
      recipientId: req.user._id,
      recipientModel: 'Consultant',
      type: 'consultation',
      title: 'Consultation Scheduled',
      message: `You have successfully scheduled the consultation session for ${confirmedDate} at ${confirmedTime}.`
    });

    // Send emails asynchronously (defensively wrapped in try-catch)
    try {
      // Email to Client
      if (consultation.clientId && consultation.clientId.email) {
        await sendEmail({
          to: consultation.clientId.email,
          subject: 'Consultation Confirmed & Scheduled - FinBridge',
          text: `Dear ${consultation.clientId.name},\n\nYour consultation session has been confirmed for ${confirmedDate} at ${confirmedTime}.\n\nMeeting Zoom Link: ${consultation.meetingLink}\n\nBest regards,\nFinBridge Solutions`,
          html: `<p>Dear <strong>${consultation.clientId.name}</strong>,</p><p>Your consultation session has been confirmed for <strong>${confirmedDate}</strong> at <strong>${confirmedTime}</strong>.</p><p><strong>Meeting Zoom Link:</strong> <a href="${consultation.meetingLink}">${consultation.meetingLink}</a></p><br/><p>Best regards,<br/>FinBridge Solutions</p>`
        });
      }

      // Email to Advisor
      await sendEmail({
        to: req.user.email,
        subject: 'Consultation Scheduled Successfully - FinBridge',
        text: `Dear ${req.user.name},\n\nYou have scheduled a consultation session with client ${consultation.clientId.name} for ${confirmedDate} at ${confirmedTime}.\n\nMeeting Zoom Link: ${consultation.meetingLink}\n\nBest regards,\nFinBridge Solutions`,
        html: `<p>Dear <strong>${req.user.name}</strong>,</p><p>You have scheduled a consultation session with client <strong>${consultation.clientId.name}</strong> for <strong>${confirmedDate}</strong> at <strong>${confirmedTime}</strong>.</p><p><strong>Meeting Zoom Link:</strong> <a href="${consultation.meetingLink}">${consultation.meetingLink}</a></p><br/><p>Best regards,<br/>FinBridge Solutions</p>`
      });
    } catch (mailErr) {
      console.error('Error sending confirmation emails:', mailErr.message);
    }

    res.status(200).json({
      status: 'success',
      message: 'Consultation scheduled successfully.',
      data: consultation
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while scheduling consultation'
    });
  }
};

// @desc    Assign a consultant to a pending consultation request (Department Admin / Admin only)
// @route   PATCH /api/consultations/:id/assign
// @access  Private (Department Admin, Admin)
export const assignConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const { consultantId } = req.body;

    if (!consultantId) {
      return res.status(400).json({
        status: 'error',
        message: 'Please select a consultant to assign.'
      });
    }

    const consultation = await Consultation.findById(id).populate('clientId', 'name email');
    if (!consultation) {
      return res.status(404).json({
        status: 'error',
        message: 'Consultation not found.'
      });
    }

    // Department admins can only assign consultations within their own department
    if (req.user.role === 'department-admin' && normalizeDept(req.user.department) !== consultation.department) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only assign consultations within your own department.'
      });
    }

    const consultant = await Consultant.findOne({ _id: consultantId, isActive: true });
    if (!consultant || normalizeDept(consultant.department) !== consultation.department) {
      return res.status(400).json({
        status: 'error',
        message: 'Selected consultant is not available in this department.'
      });
    }

    consultation.consultantId = consultant._id;
    await consultation.save();

    // Reflect the assignment on the client's FinancialProfile so the client portal
    // shows "Your Assigned Advisor" instead of "No Consultant Assigned Yet".
    try {
      const FinancialProfile = (await import('../models/FinancialProfile.js')).default;
      await FinancialProfile.findOneAndUpdate(
        { userId: consultation.clientId._id },
        { assignedConsultant: consultant._id },
        { new: true }
      );
    } catch (e) {
      console.error('[assignConsultation] FinancialProfile sync error:', e.message);
    }

    // Notify the assigned consultant
    await Notification.create({
      userId: consultant._id,
      userModel: 'Consultant',
      type: 'consultation_assigned',
      title: 'New Consultation Assigned',
      message: `You have been assigned a ${consultation.category} consultation with ${consultation.clientId.name}.`
    });

    // Notify the client
    await Notification.create({
      userId: consultation.clientId._id,
      userModel: 'Client',
      type: 'consultation',
      title: 'Advisor Assigned',
      message: `${consultant.name} has been assigned to your ${consultation.category} consultation and will confirm a meeting slot shortly.`
    });

    res.status(200).json({
      status: 'success',
      message: 'Consultant assigned successfully.',
      data: consultation
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while assigning consultant'
    });
  }
};
