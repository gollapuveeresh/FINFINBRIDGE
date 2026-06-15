import mongoose from 'mongoose';

const recommendationAuditSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'User ID is required']
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  creditBand: {
    type: String,
    required: [true, 'Credit band is required']
  },
  creditScore: {
    type: Number,
    required: [true, 'Credit score is required']
  },
  dti: {
    type: Number,
    required: [true, 'Debt-to-income (DTI) ratio is required']
  },
  activeLoanCount: {
    type: Number,
    required: [true, 'Active loan count is required']
  },
  topRecommendation: {
    type: Object,
    default: null
  },
  recommendationCount: {
    type: Number,
    required: [true, 'Recommendation count is required']
  }
}, {
  timestamps: true
});

recommendationAuditSchema.index({ userId: 1, generatedAt: -1 });

const RecommendationAudit = mongoose.model('RecommendationAudit', recommendationAuditSchema);
export default RecommendationAudit;
