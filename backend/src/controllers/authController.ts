import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/Schemas';
import { MockModel } from '../config/db';
import { sendActivationEmail, sendForgotPasswordEmail } from '../services/emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'diginotice_secret_jwt_key_12345';

export interface IPendingRegistration {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: 'SUPER_ADMIN' | 'DEPARTMENT_ADMIN' | 'STUDENT';
  department: string | null;
  academicYear: string | null;
  clubs: string[];
  profileImage: string;
  verificationToken: string;
  verificationTokenExpires: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Persistent pending registrations store (user is NOT saved to User DB until link is clicked!)
const pendingStore = new MockModel<IPendingRegistration>('pending_registrations');

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role, department, academicYear, clubs } = req.body;

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists in active User DB
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists. Please sign in.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate secure activation token (valid for 24 hours)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Profile avatar based on name
    const profileImage = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`;

    // Remove any previous pending registration for this email
    await pendingStore.deleteMany({ email: cleanEmail });

    // Store ONLY in pending store — DO NOT save to User DB yet!
    await pendingStore.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: role as 'SUPER_ADMIN' | 'DEPARTMENT_ADMIN' | 'STUDENT',
      department: department || null,
      academicYear: academicYear || null,
      profileImage,
      clubs: Array.isArray(clubs) ? clubs : [],
      verificationToken,
      verificationTokenExpires
    });

    // Send activation email with direct verification link
    const emailResult = await sendActivationEmail({
      toEmail: cleanEmail,
      userName: name.trim(),
      activationToken: verificationToken
    });

    let responseMessage = 'Registration details received!';
    if (emailResult.delivered) {
      responseMessage = 'Activation link has been sent to your Gmail inbox! Please check your email and click the link to activate your account.';
    } else if (emailResult.smtpError) {
      responseMessage = `Could not deliver email via Gmail SMTP (${emailResult.smtpError}). Please check your Gmail App Password in backend/.env. Use the activation link below to complete your registration.`;
    } else if (!emailResult.isConfigured) {
      responseMessage = 'Gmail SMTP is not configured in backend/.env. Please enter your real Gmail & 16-character App Password to receive emails in your inbox. Use the activation link below to complete registration:';
    }

    return res.status(201).json({
      message: responseMessage,
      email: cleanEmail,
      activationUrl: emailResult.activationUrl,
      etherealUrl: emailResult.etherealUrl,
      isSmtpConfigured: emailResult.isConfigured,
      delivered: emailResult.delivered,
      smtpError: emailResult.smtpError
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: err.message || 'Server error during registration' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const token = (req.query.token as string) || (req.body.token as string);

  try {
    if (!token) {
      return res.status(400).json({ message: 'Activation token is missing from the link.' });
    }

    // Find in pending registrations
    const pending = await pendingStore.findOne({ verificationToken: token });

    if (!pending) {
      return res.status(400).json({ message: 'Invalid or expired activation link. Please sign up again or request a new link.' });
    }

    // Check token expiry
    if (new Date(pending.verificationTokenExpires) < new Date()) {
      return res.status(400).json({ 
        message: 'This activation link has expired. Please request a fresh activation link.',
        expired: true,
        email: pending.email
      });
    }

    // Double check if user was somehow already saved
    const existingUser = await User.findOne({ email: pending.email });
    let savedUser = existingUser;

    if (!savedUser) {
      // ONLY NOW save the user's details to the active User database!
      savedUser = await User.create({
        name: pending.name,
        email: pending.email,
        password: pending.password,
        role: pending.role,
        department: pending.department,
        academicYear: pending.academicYear,
        profileImage: pending.profileImage,
        clubs: pending.clubs,
        isVerified: true
      });
    } else {
      await User.findByIdAndUpdate(savedUser._id!, { isVerified: true });
    }

    // Remove from pending registrations store
    await pendingStore.findByIdAndDelete(pending._id!);

    return res.json({
      message: 'Account verified & registered successfully! You can now sign in.',
      email: savedUser.email
    });
  } catch (err: any) {
    console.error('Verify email error:', err);
    return res.status(500).json({ message: 'Server error during email verification.' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  return res.status(400).json({
    message: 'OTP verification is deprecated. Please use the activation link sent to your email.'
  });
};

export const resendVerification = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user is already registered and active in User DB
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Your account is already active and verified. Please sign in.' });
    }

    // Find in pending store
    const pending = await pendingStore.findOne({ email: cleanEmail });
    if (!pending) {
      return res.status(400).json({ message: 'No pending registration found for this email. Please sign up first.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pendingStore.findByIdAndUpdate(pending._id!, {
      verificationToken,
      verificationTokenExpires
    });

    const emailResult = await sendActivationEmail({
      toEmail: cleanEmail,
      userName: pending.name,
      activationToken: verificationToken
    });

    let responseMessage = 'Fresh activation link generated!';
    if (emailResult.delivered) {
      responseMessage = 'A fresh activation link has been sent to your Gmail inbox!';
    } else if (emailResult.smtpError) {
      responseMessage = `Could not deliver email via Gmail SMTP (${emailResult.smtpError}). Please check your Gmail credentials in backend/.env.`;
    } else if (!emailResult.isConfigured) {
      responseMessage = 'Gmail SMTP is not configured in backend/.env. Use the activation link below to complete registration:';
    }

    return res.json({
      message: responseMessage,
      email: cleanEmail,
      activationUrl: emailResult.activationUrl,
      etherealUrl: emailResult.etherealUrl,
      isSmtpConfigured: emailResult.isConfigured,
      delivered: emailResult.delivered,
      smtpError: emailResult.smtpError
    });
  } catch (err: any) {
    console.error('Resend verification error:', err);
    return res.status(500).json({ message: 'Server error resending verification link.' });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  return resendVerification(req, res);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      // Check if pending registration exists
      const pending = await pendingStore.findOne({ email: cleanEmail });
      if (pending) {
        return res.status(403).json({
          message: 'Your account is not activated yet. Please click the activation link sent to your email to complete registration.',
          isUnverified: true,
          email: cleanEmail
        });
      }
      return res.status(400).json({ message: 'No account found with this email address. Please check your email or Sign Up.' });
    }

    // Verify password against stored hash
    let isMatch = false;
    if (user.password) {
      isMatch = await bcrypt.compare(password.trim(), user.password);
    }

    if (!isMatch) {
      return res.status(400).json({ message: 'Password does not match. Please check your password.' });
    }

    // Enforce email verification (if isVerified is explicitly false)
    if (user.isVerified === false) {
      return res.status(403).json({
        message: 'Your account is not activated yet. Please click the activation link sent to your email to activate your account.',
        isUnverified: true,
        email: user.email
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, department: user.department },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return token + user details (omit password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      academicYear: user.academicYear,
      profileImage: user.profileImage,
      clubs: user.clubs || [],
      isVerified: user.isVerified ?? true
    };

    return res.json({
      token,
      user: userResponse
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      academicYear: user.academicYear,
      profileImage: user.profileImage,
      clubs: user.clubs || []
    };
    return res.json(userResponse);
  } catch (err: any) {
    return res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

// SSO OAuth Planceholders for future Google/Microsoft integrations
export const googleLoginPlaceholder = async (req: Request, res: Response) => {
  return res.status(501).json({
    message: 'Google Workspace OAuth is structured and will be enabled in production. Currently, please use the demo buttons for testing.'
  });
};

export const microsoftLoginPlaceholder = async (req: Request, res: Response) => {
  return res.status(501).json({
    message: 'Microsoft 365 SSO is structured and will be enabled in production. Currently, please use the demo buttons for testing.'
  });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Please enter your email address.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists in active User DB
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      // Check if registration is still pending
      const pending = await pendingStore.findOne({ email: cleanEmail });
      if (pending) {
        return res.status(400).json({
          message: 'This account has not been activated yet. Please click the activation link in your email first.'
        });
      }
      return res.status(404).json({
        message: 'No account found with this email address. Please sign up first.'
      });
    }

    // Generate 6-digit verification code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Update user record
    await User.findByIdAndUpdate(user._id!, {
      otpCode,
      otpExpires
    });

    // Send the verification code email
    const emailResult = await sendForgotPasswordEmail({
      toEmail: cleanEmail,
      userName: user.name || 'Campus Member',
      resetCode: otpCode
    });

    let message = 'A 6-digit password reset code has been sent to your email!';
    if (emailResult.delivered) {
      message = 'A 6-digit verification code has been sent to your Gmail inbox. Please check your email.';
    } else if (emailResult.smtpError) {
      message = `Could not deliver email via SMTP (${emailResult.smtpError}). Please check credentials in backend/.env.`;
    }

    return res.json({
      message,
      email: cleanEmail,
      delivered: emailResult.delivered,
      etherealUrl: emailResult.etherealUrl,
      isSmtpConfigured: emailResult.isConfigured,
      smtpError: emailResult.smtpError,
      devCode: !emailResult.delivered ? otpCode : undefined
    });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ message: 'Server error processing password reset request.' });
  }
};

export const verifyResetCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  try {
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email.' });
    }

    if (!user.otpCode || user.otpCode !== cleanCode) {
      return res.status(400).json({ message: 'Invalid verification code. Please check and try again.' });
    }

    if (user.otpExpires && new Date(user.otpExpires) < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
    }

    return res.json({
      success: true,
      message: 'Verification code verified successfully. You can now set your new password.'
    });
  } catch (err: any) {
    console.error('Verify reset code error:', err);
    return res.status(500).json({ message: 'Server error verifying reset code.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;

  try {
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email.' });
    }

    if (!user.otpCode || user.otpCode !== cleanCode) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    if (user.otpExpires && new Date(user.otpExpires) < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);

    // Update user password and clear OTP
    await User.findByIdAndUpdate(user._id!, {
      password: hashedPassword,
      otpCode: null,
      otpExpires: null
    });

    return res.json({
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.'
    });
  } catch (err: any) {
    console.error('Reset password error:', err);
    return res.status(500).json({ message: 'Server error resetting password.' });
  }
};

