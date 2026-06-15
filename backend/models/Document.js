import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  clientId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  name:        { type: String, required: true, trim: true },
  type:        { type: String, enum: ['Report','Proposal','Tax Doc','Quote','KYC','Other'], default: 'Other' },
  size:        { type: String, default: '—' },
  status:      { type: String, enum: ['Uploaded','Pending Sign','Signed'], default: 'Uploaded' },
  department:  { type: String, enum: ['loans','tax','investment','insurance','wealth'], default: null },
  canDownload: { type: Boolean, default: false },
  fileData:    { type: String, default: null }, // base64 or URL
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);
export default Document;
