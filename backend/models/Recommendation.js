import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema(
  {
    consultantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultant',
      required: true,
    },
    clientName: { type: String, required: true, trim: true },
    productCategory: { type: String, required: true, trim: true },
    details: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'sent', 'archived'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

const Recommendation = mongoose.model('Recommendation', recommendationSchema);
export default Recommendation;
