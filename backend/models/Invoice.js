import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  clientId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Client',     required: true },
  consultantId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Consultant', required: true },
  proposalId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal',   default: null },
  department:    { type: String, enum: ['loans','tax','investment','insurance','wealth'], required: true },
  serviceTitle:  { type: String, required: true, trim: true },
  lineItems: [{
    description: { type: String, required: true },
    amount:      { type: Number, required: true },
  }],
  subtotal:    { type: Number, required: true },
  tax:         { type: Number, default: 0 },         // GST amount
  taxPercent:  { type: Number, default: 18 },        // 18% GST
  totalAmount: { type: Number, required: true },
  currency:    { type: String, default: 'INR' },
  status:      { type: String, enum: ['draft','sent','paid','overdue','cancelled'], default: 'draft' },
  dueDate:     { type: Date },
  paidAt:      { type: Date, default: null },
  notes:       { type: String, trim: true },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

invoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
