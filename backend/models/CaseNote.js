import mongoose from 'mongoose';

const caseNoteSchema = new mongoose.Schema({
  consultantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Consultant',
  },
  clientId: {
    type: String,
    required: true,
    trim: true,
  },
  clientName: {
    type: String,
    required: true,
    trim: true,
  },
  clientCompany: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    default: 'General',
  },
  text: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Ensure one note doc per consultant + client combination
caseNoteSchema.index({ consultantId: 1, clientId: 1 }, { unique: true });

const CaseNote = mongoose.model('CaseNote', caseNoteSchema);
export default CaseNote;
