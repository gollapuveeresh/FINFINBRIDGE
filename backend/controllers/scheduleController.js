import EmailReminder from '../models/EmailReminder.js';
import nodemailer from 'nodemailer';

// Schedule email reminder 24 hrs before meeting
export const scheduleEmailReminder = async (req, res) => {
  try {
    const { meetingId, clientName, clientEmail, meetingTime, meetingType } = req.body;
    if (!meetingId || !meetingTime) {
      return res.status(400).json({ status: 'error', message: 'meetingId and meetingTime are required' });
    }

    const meetingDate = new Date(meetingTime);
    const reminderDate = new Date(meetingDate.getTime() - 24 * 60 * 60 * 1000); // 24 hrs before

    const reminder = await EmailReminder.findOneAndUpdate(
      { meetingId },
      {
        meetingId,
        consultantId: req.user._id,
        clientName,
        clientEmail,
        meetingTime: meetingDate,
        meetingType,
        scheduledFor: reminderDate,
        status: 'pending',
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ status: 'success', data: reminder, message: 'Email reminder scheduled 24 hours before meeting.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Cancel a scheduled reminder
export const cancelEmailReminder = async (req, res) => {
  try {
    await EmailReminder.findOneAndUpdate(
      { meetingId: req.params.meetingId, consultantId: req.user._id },
      { status: 'cancelled' }
    );
    res.status(200).json({ status: 'success', message: 'Reminder cancelled' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Send reminder email immediately (called by a cron or manual trigger)
export const sendReminderEmail = async ({ clientName, clientEmail, meetingType, meetingTime }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const meetingDate = new Date(meetingTime).toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    await transporter.sendMail({
      from: `"FinBridge Solutions" <${process.env.SMTP_USER}>`,
      to: clientEmail,
      subject: `Reminder: Upcoming ${meetingType} Meeting Tomorrow`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
          <h2 style="color:#1a3c5e;">FinBridge Solutions — Meeting Reminder</h2>
          <p>Dear <strong>${clientName}</strong>,</p>
          <p>This is a reminder that you have an upcoming consultation scheduled for <strong>tomorrow</strong>.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px;font-weight:bold;color:#555;">Meeting Type:</td><td style="padding:8px;">${meetingType}</td></tr>
            <tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;color:#555;">Date & Time:</td><td style="padding:8px;">${meetingDate}</td></tr>
          </table>
          <p>Please ensure you are available at the scheduled time. If you need to reschedule, contact your advisor at your earliest convenience.</p>
          <p style="color:#888;font-size:12px;margin-top:24px;">© 2026 FinBridge Solutions. All rights reserved.</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error('Email reminder send failed:', err.message);
    return false;
  }
};

// Cron job handler: send all pending reminders whose scheduledFor time has passed
export const processPendingReminders = async () => {
  try {
    const now = new Date();
    const due = await EmailReminder.find({ status: 'pending', scheduledFor: { $lte: now } });
    for (const reminder of due) {
      const sent = await sendReminderEmail({
        clientName: reminder.clientName,
        clientEmail: reminder.clientEmail,
        meetingType: reminder.meetingType,
        meetingTime: reminder.meetingTime,
      });
      reminder.status = sent ? 'sent' : 'pending';
      reminder.reminderSentAt = sent ? now : null;
      await reminder.save();
    }
  } catch (err) {
    console.error('processPendingReminders error:', err.message);
  }
};
