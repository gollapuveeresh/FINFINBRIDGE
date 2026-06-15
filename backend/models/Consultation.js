import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client ID is required']
  },
  consultantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultant',
    default: null
  },
  department: {
    type: String,
    enum: ['loans', 'tax', 'investment', 'insurance', 'wealth'],
    required: [true, 'Department is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending'
  },
  clientNotes: {
    type: String,
    trim: true,
    default: ''
  },
  confirmedDate: {
    type: String,
    default: ''
  },
  confirmedTime: {
    type: String,
    default: ''
  },
  meetingLink: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Consultation = mongoose.model('Consultation', consultationSchema);
export default Consultation;
