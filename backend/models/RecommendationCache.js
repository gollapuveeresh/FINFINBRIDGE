import mongoose from 'mongoose';

const recommendationCacheSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'User ID is required'],
    unique: true
  },
  profileHash: {
    type: String,
    required: [true, 'Profile hash is required']
  },
  creditScore: {
    type: Number,
    required: [true, 'Credit score is required']
  },
  recommendations: {
    type: Object,
    required: [true, 'Recommendations object is required']
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required']
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for fast expiry-based queries
recommendationCacheSchema.index({ expiresAt: 1 });

const RecommendationCache = mongoose.model('RecommendationCache', recommendationCacheSchema);
export default RecommendationCache;

