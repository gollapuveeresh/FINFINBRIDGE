import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  leadId: { type: String, unique: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  income: { type: Number },
  requirement: { type: String, trim: true },
  budget: { type: Number },
  source: {
    type: String,
    enum: ['website_form', 'google_ads', 'facebook_ads', 'instagram', 'linkedin', 'referral', 'walk_in', 'call_center', 'partner_channel'],
    default: 'website_form'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'interested', 'qualified', 'rejected', 'lost', 'assigned', 'consultation', 'proposal', 'won'],
    default: 'new'
  },
  priority: { type: String, enum: ['hot', 'warm', 'cold'], default: 'warm' },
  score: { type: Number, default: 0, min: 0, max: 100 },
  department: {
    type: String,
    enum: ['loans', 'tax', 'investment', 'insurance', 'wealth'],
    default: null
  },
  serviceType: { type: String, trim: true },
  assignedConsultant: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultant', default: null },
  assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  crmOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  convertedClientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', default: null },
  notes: [{ text: String, addedBy: String, addedAt: { type: Date, default: Date.now } }],
  tags: [String],
  followUpDate: { type: Date },
  lastContactedAt: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

leadSchema.pre('save', async function (next) {
  if (!this.leadId) {
    const count = await mongoose.model('Lead').countDocuments();
    this.leadId = `LEAD-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
