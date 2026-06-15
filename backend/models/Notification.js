import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Support both old field name (recipientId) and new field name (userId) for compatibility
  recipientId: { type: mongoose.Schema.Types.ObjectId, refPath: 'recipientModel' },
  recipientModel: { type: String, enum: ['Client', 'Consultant', 'Admin'] },
  userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'userModel' },
  userModel: { type: String, enum: ['Client', 'Consultant', 'Admin'] },
  type: {
    type: String,
    default: 'consultation'
  },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true
  },
  isRead: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
