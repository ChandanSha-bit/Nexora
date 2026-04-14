import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';
import Message from '../models/Message.js';
import cloudinary from '../config/cloudinary.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const OTP_EXPIRY_MINUTES = 10;
const RESET_SESSION_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_EMAIL_RETRIES = 3;

const generateOtp = () => {
  const bytes = crypto.randomBytes(3);
  const num = bytes.readUIntBE(0, 3) % 1000000;
  return String(num).padStart(6, '0');
};

const isEmail = (value = '') => /\S+@\S+\.\S+/.test(value);
const isPhone = (value = '') => /^[+]?[0-9]{8,15}$/.test(value.replace(/\s+/g, ''));

const normalizeIdentifier = (identifier = '') => identifier.trim().toLowerCase();

const findUserByIdentifier = async (identifier) => {
  const normalized = normalizeIdentifier(identifier);
  if (isEmail(normalized)) {
    return User.findOne({ email: normalized });
  }

  const normalizedPhone = normalized.replace(/\s+/g, '');
  return User.findOne({ phone: normalizedPhone });
};

const getSendGridConfig = () => {
  const sendGridApiKey = process.env.SENDGRID_API_KEY?.trim();
  const emailFrom = process.env.EMAIL_FROM?.trim();
  const templateId = process.env.SENDGRID_TEMPLATE_ID?.trim() || null;
  return { sendGridApiKey, emailFrom, templateId };
};

const wait = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const sendOtpNotification = async ({ identifier, otp }) => {
  const { sendGridApiKey, emailFrom, templateId } = getSendGridConfig();
  if (!sendGridApiKey || !emailFrom) {
    throw new Error(
      'SendGrid not configured. Set SENDGRID_API_KEY and EMAIL_FROM.'
    );
  }

  if (!isEmail(identifier)) {
    throw new Error('OTP delivery is currently supported only for email identifiers');
  }

  sgMail.setApiKey(sendGridApiKey);
  console.log(`[SENDGRID] Sending OTP email to ${identifier} (template: ${templateId || 'none'})`);

  const msg = templateId
    ? {
        to: identifier,
        from: emailFrom,
        templateId,
        dynamicTemplateData: { otp: String(otp) },
      }
    : {
        to: identifier,
        from: emailFrom,
        subject: 'Password Reset OTP',
        text: `Your OTP is ${otp}. It is valid for ${OTP_EXPIRY_MINUTES} minutes.`,
        html: `<html><head><title>OTP Verification</title></head><body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;"><div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 10px; text-align: center;"><h2 style="color: #333;">Password Reset</h2><p style="color: #555;">Use the OTP below to reset your password:</p><h1 style="color: #000; letter-spacing: 5px;">${otp}</h1><p style="color: #777;">This OTP is valid for ${OTP_EXPIRY_MINUTES} minutes.</p><p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p></div></body></html>`,
      };

  let lastError = null;
  for (let attempt = 1; attempt <= MAX_EMAIL_RETRIES; attempt += 1) {
    try {
      await sgMail.send(msg);
      console.log(`[SENDGRID] OTP email delivered to ${identifier} on attempt ${attempt}`);
      return;
    } catch (error) {
      lastError = error;
      const sendGridDetail = error?.response?.body || error?.response?.text || '';
      console.error(
        `[SENDGRID] OTP email attempt ${attempt} failed for ${identifier}:`,
        error.message,
        sendGridDetail
      );
      if (attempt < MAX_EMAIL_RETRIES) {
        await wait(500 * attempt);
      }
    }
  }

  throw lastError || new Error('Failed to send OTP email');
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    // 1. Validation
    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 3. Hash Password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create User in DB
    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    if (newUser) {
      await newUser.save();
      
      // Generate Secure Token
      const token = generateToken(newUser._id);

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profilePic: newUser.profilePic,
        token: token,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error in register controller", error.message);
    if (error?.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    // 1. Validation
    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Find User
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Verify Password using bcrypt
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 4. Success Response
    const token = generateToken(user._id);
    
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      token: token,
    });
  } catch (error) {
    console.error("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logoutUser = (req, res) => {
  // In a token-based flow, frontend completely handles logout by throwing away the token.
  // We simply reassure the client.
  res.status(200).json({ message: "Logged out successfully" });
};

export const requestPasswordResetOtp = async (req, res) => {
  try {
    const { identifier } = req.body;
    console.log(`[AUTH] /forgot-password called for identifier=${identifier || 'N/A'}`);

    if (!identifier) {
      return res.status(400).json({ message: "Email or phone is required" });
    }

    const normalizedIdentifier = normalizeIdentifier(identifier);
    if (!isEmail(normalizedIdentifier) && !isPhone(normalizedIdentifier)) {
      return res.status(400).json({ message: "Please enter a valid email or phone number" });
    }

    const user = await findUserByIdentifier(normalizedIdentifier);
    if (!user) {
      return res.status(200).json({
        message: "If an account exists, OTP sent successfully.",
        nextStep: "verify-otp",
        resendAfterSeconds: RESEND_COOLDOWN_SECONDS,
      });
    }

    const otp = generateOtp();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    user.passwordResetOtpHash = otpHash;
    user.passwordResetOtpExpiresAt = otpExpiry;
    user.passwordResetSessionTokenHash = null;
    user.passwordResetSessionExpiresAt = null;
    await user.save();

    await sendOtpNotification({ identifier: normalizedIdentifier, otp });

    return res.status(200).json({
      message: "If an account exists, OTP sent successfully.",
      nextStep: "verify-otp",
      resendAfterSeconds: RESEND_COOLDOWN_SECONDS,
    });
  } catch (error) {
    console.error("Error in requestPasswordResetOtp controller:", error.message);
    if (error.message?.includes('SendGrid not configured')) {
      return res.status(500).json({
        message: 'SendGrid is not configured. Add SENDGRID_API_KEY and EMAIL_FROM in backend .env.',
      });
    }
    return res.status(500).json({ message: `Failed to send OTP: ${error.message}` });
  }
};

export const sendPasswordResetTestEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeIdentifier(email || '');

    if (!isEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    const { sendGridApiKey, emailFrom } = getSendGridConfig();
    if (!sendGridApiKey || !emailFrom) {
      return res.status(500).json({
        message: 'SendGrid is not configured. Add SENDGRID_API_KEY and EMAIL_FROM, then retry.',
      });
    }
    sgMail.setApiKey(sendGridApiKey);
    await sgMail.send({
      to: normalizedEmail,
      from: emailFrom,
      subject: 'SendGrid Test Email - Chat App',
      text: 'This is a test email from your Chat App SendGrid configuration. If you received this, delivery works.',
      html: '<p>This is a test email from your Chat App <strong>SendGrid</strong> configuration. If you received this, delivery works.</p>',
    });

    return res.status(200).json({ message: 'Test email sent successfully. Check inbox/spam/promotions.' });
  } catch (error) {
    console.error('[SENDGRID] Test email failed:', error.message, error?.response?.body || '');
    return res.status(500).json({ message: `Test email failed: ${error.message}` });
  }
};

export const verifyPasswordResetOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({ message: "Email/phone and OTP are required" });
    }

    const normalizedIdentifier = normalizeIdentifier(identifier);
    if (!isEmail(normalizedIdentifier) && !isPhone(normalizedIdentifier)) {
      return res.status(400).json({ message: "Please enter a valid email or phone number" });
    }

    const user = await findUserByIdentifier(normalizedIdentifier);

    if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt) {
      return res.status(400).json({ message: "Wrong OTP or OTP expired" });
    }

    if (user.passwordResetOtpExpiresAt.getTime() < Date.now()) {
      user.passwordResetOtpHash = null;
      user.passwordResetOtpExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: "OTP expired. Please request a new OTP." });
    }

    const incomingOtpHash = crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
    if (incomingOtpHash !== user.passwordResetOtpHash) {
      return res.status(400).json({ message: "Wrong OTP. Please try again." });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetSessionTokenHash = resetTokenHash;
    user.passwordResetSessionExpiresAt = new Date(
      Date.now() + RESET_SESSION_EXPIRY_MINUTES * 60 * 1000
    );
    await user.save();

    return res.status(200).json({
      message: "OTP verified successfully.",
      resetToken,
      nextStep: "reset-password",
    });
  } catch (error) {
    console.error("Error in verifyPasswordResetOtp controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { identifier, resetToken, newPassword } = req.body;

    if (!identifier || !resetToken || !newPassword) {
      return res.status(400).json({ message: "Email/phone, reset token, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedIdentifier = normalizeIdentifier(identifier);
    if (!isEmail(normalizedIdentifier) && !isPhone(normalizedIdentifier)) {
      return res.status(400).json({ message: "Please enter a valid email or phone number" });
    }

    const user = await findUserByIdentifier(normalizedIdentifier);

    if (!user || !user.passwordResetSessionTokenHash || !user.passwordResetSessionExpiresAt) {
      return res.status(400).json({ message: "Session expired. Verify OTP again." });
    }

    if (user.passwordResetSessionExpiresAt.getTime() < Date.now()) {
      user.passwordResetSessionTokenHash = null;
      user.passwordResetSessionExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: "Session expired. Verify OTP again." });
    }

    const incomingResetTokenHash = crypto.createHash('sha256').update(String(resetToken).trim()).digest('hex');
    if (incomingResetTokenHash !== user.passwordResetSessionTokenHash) {
      return res.status(400).json({ message: "Invalid session. Verify OTP again." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordResetOtpHash = null;
    user.passwordResetOtpExpiresAt = null;
    user.passwordResetSessionTokenHash = null;
    user.passwordResetSessionExpiresAt = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successful. Please log in." });
  } catch (error) {
    console.error("Error in resetPasswordWithOtp controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ─── DELETE ACCOUNT ───────────────────────────────────────────────────────────

// Step 1: Send OTP to authenticated user's email for account deletion
export const requestDeleteAccountOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOtp();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    user.passwordResetOtpHash = otpHash;
    user.passwordResetOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await user.save();

    await sendOtpNotification({ identifier: user.email, otp });

    return res.status(200).json({ message: 'OTP sent to your email. Verify to confirm deletion.' });
  } catch (error) {
    console.error('Error in requestDeleteAccountOtp:', error.message);
    return res.status(500).json({ message: `Failed to send OTP: ${error.message}` });
  }
};

// Step 2: Verify OTP then permanently delete account + all data
export const deleteAccount = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ message: 'OTP is required' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check OTP exists
    if (!user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt) {
      return res.status(400).json({ message: 'No OTP requested. Please request a new OTP.' });
    }

    // Check expiry
    if (user.passwordResetOtpExpiresAt.getTime() < Date.now()) {
      user.passwordResetOtpHash = null;
      user.passwordResetOtpExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: 'OTP expired. Please request a new OTP.' });
    }

    // Verify OTP
    const incomingHash = crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
    if (incomingHash !== user.passwordResetOtpHash) {
      return res.status(400).json({ message: 'Wrong OTP. Please try again.' });
    }

    const userId = user._id;

    // 1. Delete profile picture from Cloudinary
    if (user.profilePic) {
      try {
        const urlParts = user.profilePic.split('/');
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExt.split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.warn('[DELETE] Could not delete profile pic from Cloudinary:', err.message);
      }
    }

    // 2. Find and delete all message images from Cloudinary
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
      image: { $ne: '' },
    });

    for (const msg of messages) {
      if (msg.image) {
        try {
          const urlParts = msg.image.split('/');
          const publicIdWithExt = urlParts[urlParts.length - 1];
          const publicId = publicIdWithExt.split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.warn('[DELETE] Could not delete message image:', err.message);
        }
      }
    }

    // 3. Delete all messages sent or received by this user
    await Message.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] });

    // 4. Delete the user
    await User.findByIdAndDelete(userId);

    console.log(`[DELETE] Account permanently deleted for userId=${userId}`);

    return res.status(200).json({ message: 'Account deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteAccount:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
