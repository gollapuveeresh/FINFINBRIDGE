import mongoose from 'mongoose';

const emailReminderSchema = new mongoose.Schema({
  meetingId: { type: String, required: true, unique: true },
  consultantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultant' },
  clientName: { type: String },
  clientEmail: { type: String },
  meetingTime: { type: Date },
  meetingType: { type: String },
  reminderSentAt: { type: Date, default: null },
  scheduledFor: { type: Date }, // 24hrs before meeting
  status: { type: String, enum: ['pending', 'sent', 'cancelled'], default: 'pending' },
}, { timestamps: true });

const EmailReminder = mongoose.model('EmailReminder', emailReminderSchema);
export default EmailReminder;
