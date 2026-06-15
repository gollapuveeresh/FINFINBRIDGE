import Admin from '../models/Admin.js';
import Consultant from '../models/Consultant.js';
import Client from '../models/Client.js';
import Lead from '../models/Lead.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Helper to generate a JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Expires in 7 days as requested
  );
};

// Helper to create SMTP transporter dynamically (real SMTP from env, fallback to Ethereal SMTP)
const getTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const isSecure = process.env.SMTP_SECURE === 'true';
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate testing SMTP credentials
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, companyName, department } = req.body;

    // Check if user already exists in any of the collections
    const clientExists = await Client.findOne({ email });
    const consultantExists = await Consultant.findOne({ email });
    const adminExists = await Admin.findOne({ email });

    if (clientExists || consultantExists || adminExists) {
      return res.status(400).json({
        status: 'error',
        message: 'A user with this email already exists',
      });
    }

    // Generate secure email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const emailVerificationExpires = Date.now() + 24 * 3600 * 1000; // 24 hours

    // Create user in the correct collection depending on requested role
    let user;
    const targetRole = role || 'client';

    if (targetRole === 'admin' || targetRole === 'department-admin' || targetRole === 'crm-admin') {
      user = await Admin.create({
        name,
        email,
        password,
        role: targetRole,
        department: targetRole === 'department-admin' ? (department || 'loans') : targetRole === 'crm-admin' ? 'crm' : 'platform',
        phone,
        companyName,
        isEmailVerified: false,
        emailVerificationToken,
        emailVerificationExpires,
      });
    } else if (targetRole === 'consultant') {
      user = await Consultant.create({
        name,
        email,
        password,
        role: 'consultant',
        department: department || 'loans',
        phone,
        companyName,
        isEmailVerified: false,
        emailVerificationToken,
        emailVerificationExpires,
      });
    } else {
      user = await Client.create({
        name,
        email,
        password,
        role: 'client',
        phone,
        companyName,
        department: department || null,
        isEmailVerified: false,
        emailVerificationToken,
        emailVerificationExpires,
      });

      // Auto-create a CRM lead so CRM admin sees new registrations immediately
      try {
        const existing = await Lead.findOne({ email, isActive: true });
        if (!existing) {
          // Score based on registration data
          let score = 5; // email
          if (phone) score += 10;
          // Infer department from serviceType/department if provided
          const inferredDept = department || null;
          // Infer department from service type name
          const inferDeptFromService = (s) => {
            if (!s) return null;
            const sl = s.toLowerCase();
            if (sl.includes('loan') || sl.includes('mortgage')) return 'loans';
            if (sl.includes('tax') || sl.includes('itr') || sl.includes('gst')) return 'tax';
            if (sl.includes('invest') || sl.includes('mutual') || sl.includes('sip')) return 'investment';
            if (sl.includes('insurance') || sl.includes('policy')) return 'insurance';
            if (sl.includes('wealth') || sl.includes('estate')) return 'wealth';
            return null;
          };
          const resolvedDept = inferredDept || inferDeptFromService(req.body.serviceType);
          const priority = score >= 65 ? 'hot' : score >= 35 ? 'warm' : 'cold';
          await Lead.create({
            name,
            email,
            phone: phone || '',
            source: 'website_form',
            status: 'new',
            score,
            priority,
            department: resolvedDept,
            serviceType: req.body.serviceType || '',
            budget: req.body.budget || 0,
            income: req.body.income || 0,
            // Do NOT set convertedClientId here — that only happens after formal conversion
            notes: [{ text: 'Lead auto-created from client self-registration portal.', addedBy: 'System' }],
          });
        }
      } catch (leadErr) {
        console.error('[register] Lead auto-create error:', leadErr.message);
      }
    }

    // Send email verification link
    const transporter = await getTransporter();
    const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : 'http://localhost:5173');
    const verifyUrl = `${origin}/verify-email?token=${verificationToken}`;
    const isRealSMTP = !!(process.env.SMTP_HOST && process.env.SMTP_USER);

    const mailOptions = {
      from: '"FinBridge Solutions" <no-reply@finbridge.com>',
      to: user.email,
      subject: 'FinBridge Email Verification',
      text: `Welcome to FinBridge Solutions! Please verify your email by clicking the following link:\n\n${verifyUrl}\n\nThis link is valid for 24 hours.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #f9f9f9;">
          <h2 style="color: #0d6efd; text-align: center;">Welcome to FinBridge!</h2>
          <p>Hello ${user.name},</p>
          <p>Thank you for registering with FinBridge. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #0d6efd; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email</a>
          </div>
          <p>If the button doesn't work, copy and paste the following link into your browser:</p>
          <p style="word-break: break-all;"><a href="${verifyUrl}">${verifyUrl}</a></p>
          <p>This verification link is valid for 24 hours.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">FinBridge Solutions &copy; 2026</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = !isRealSMTP ? nodemailer.getTestMessageUrl(info) : undefined;

    if (!isRealSMTP) {
      console.log('----------------------------------------------------');
      console.log('Verification Email Sent!');
      console.log(`To: ${user.email}`);
      console.log(`Preview URL: ${previewUrl}`);
      console.log('----------------------------------------------------');
    }

    res.status(201).json({
      status: 'success',
      message: 'Registration successful! A verification link has been sent to your email.',
      previewUrl,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server registration error',
    });
  }
};

// @desc    Authenticate user and get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password',
      });
    }

    // Find user in Client, Consultant, or Admin
    let user = await Client.findOne({ email });
    let role = 'client';

    if (!user) {
      user = await Consultant.findOne({ email });
      role = 'consultant';
    }

    if (!user) {
      user = await Admin.findOne({ email });
      role = user?.role || 'admin';
    }

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'Your account is deactivated. Please contact support.',
      });
    }

    // Check if user is email verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        status: 'error',
        message: 'Please verify your email address before logging in. Check your inbox for the verification link.',
      });
    }

    // Check password correctness
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role || role);

    res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || role,
        department: user.department,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server login error',
    });
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    // req.user is already populated and validated in authMiddleware
    if (!req.user) {
      return res.status(404).json({
        status: 'error',
        message: 'User profile not found',
      });
    }

    res.status(200).json({
      status: 'success',
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server profile fetching error',
    });
  }
};

// @desc    Forgot Password - generates token and sends email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email address is required',
      });
    }

    // Find user by email across all three collections
    let user = await Client.findOne({ email });
    if (!user) user = await Consultant.findOne({ email });
    if (!user) user = await Admin.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No account with that email address exists',
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token to store in database
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration

    // Save to user model (bypass validation for other fields if necessary)
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save({ validateBeforeSave: false });

    // Setup dynamic transporter
    const transporter = await getTransporter();
    const isRealSMTP = !!(process.env.SMTP_HOST && process.env.SMTP_USER);
    const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : 'http://localhost:5173');
    const resetUrl = `${origin}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: '"FinBridge Solutions" <no-reply@finbridge.com>',
      to: user.email,
      subject: 'FinBridge Password Reset Request',
      text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n` +
            `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
            `${resetUrl}\n\n` +
            `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #f9f9f9;">
          <h2 style="color: #0d6efd; text-align: center;">FinBridge Password Reset</h2>
          <p>Hello ${user.name || 'User'},</p>
          <p>You requested a password reset for your FinBridge account. Please click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #0d6efd; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>If the button doesn't work, copy and paste the following link into your browser:</p>
          <p style="word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link is valid for 1 hour. If you did not request a password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">FinBridge Solutions &copy; 2026</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = !isRealSMTP ? nodemailer.getTestMessageUrl(info) : undefined;

    if (!isRealSMTP) {
      console.log('----------------------------------------------------');
      console.log('Password Reset Email Sent!');
      console.log(`To: ${user.email}`);
      console.log(`Preview URL: ${previewUrl}`);
      console.log('----------------------------------------------------');
    }

    res.status(200).json({
      status: 'success',
      message: 'Password reset email sent successfully.',
      previewUrl
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error during forgot password processing',
    });
  }
};

// @desc    Reset Password - verifies token and updates password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Reset token and new password are required',
      });
    }

    // Hash the token received in request to search DB
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching token and unexpired validity across all three collections
    let user = await Client.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      user = await Consultant.findOne({
        resetPasswordToken,
        resetPasswordExpires: { $gt: Date.now() }
      });
    }

    if (!user) {
      user = await Admin.findOne({
        resetPasswordToken,
        resetPasswordExpires: { $gt: Date.now() }
      });
    }

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Password reset token is invalid or has expired',
      });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Also auto-verify email when they reset password (a good UX flow)
    user.isEmailVerified = true;

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error during password reset processing',
    });
  }
};

// @desc    Verify Email - activates user account
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Verification token is required',
      });
    }

    // Hash the token received in request to search DB
    const emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching token and unexpired validity across all collections
    let user = await Client.findOne({
      emailVerificationToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      user = await Consultant.findOne({
        emailVerificationToken,
        emailVerificationExpires: { $gt: Date.now() }
      });
    }

    if (!user) {
      user = await Admin.findOne({
        emailVerificationToken,
        emailVerificationExpires: { $gt: Date.now() }
      });
    }

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Verification link is invalid or has expired',
      });
    }

    // Activate and verify user
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully! You can now log in to your account.',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error during email verification',
    });
  }
};
