import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    let transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const isSecure = process.env.SMTP_SECURE === 'true';
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: isSecure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Ethereal test credentials fallback
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: `"FinBridge Solutions" <${process.env.SMTP_USER || 'no-reply@finbridge.com'}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully dispatched to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Error occurred while sending email to ${to}:`, error.message);
    throw error;
  }
};

export default sendEmail;
