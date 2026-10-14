import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { googleClient } from '../config/googleAuth.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokenUtils.js';
import { hashToken } from '../utils/hashUtils.js';
import { sendEmail } from '../emails/mailer.js';
import { otpEmail } from '../emails/otpEmail.js';
import { uploadToCloudinary, uploadUrlToCloudinary } from '../middlewares/uploadMiddleware.js';

// Helper to format consistent user responses containing full citizen profile data
const formatUserResponse = (userDoc) => {
  const userObj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete userObj.password;
  delete userObj.refreshToken;
  delete userObj.otp;
  delete userObj.otpExpires;
  userObj.id = userObj._id || userObj.id;
  return userObj;
};

// @desc    Initiate passwordless login / send 6-digit OTP code to email
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  return sendOtp(req, res, next);
};

// @desc    Send 6-digit OTP code to email for passwordless login / registration
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOtp = async (req, res, next) => {
  try {
    const { email, name, role, phone, cscCenterId, ngoOrg, assignedDistricts, policyInsightOptIn } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail }).select('+otp +otpExpires');
    const isNewUser = !user;

    if (!user) {
      // Upload avatar to Cloudinary if file provided during registration
      let avatarUrl = '';
      if (req.file) {
        avatarUrl = (await uploadToCloudinary(req.file.buffer)) || '';
      }

      user = new User({
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        avatar: avatarUrl,
        role: role || 'citizen',
        phone: phone || '',
        cscCenterId: cscCenterId || '',
        ngoOrg: ngoOrg || '',
        assignedDistricts: Array.isArray(assignedDistricts) ? assignedDistricts : assignedDistricts ? [assignedDistricts] : [],
        policyInsightOptIn: policyInsightOptIn !== undefined ? policyInsightOptIn : true,
        methods: ['local'],
        isVerified: false,
      });
    } else {
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (role && user.role === 'citizen') user.role = role;
      if (user.methods && !user.methods.includes('local')) {
        user.methods.push('local');
      }
    }

    // Generate 6-digit numeric OTP code
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = hashToken(rawOtp);
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    // Await sendEmail so cloud container runtimes (Render/Vercel/Railway) do not terminate context before email dispatch finishes
    try {
      await sendEmail({
        to: user.email,
        subject: 'Your Scheme Setu Verification Code',
        html: otpEmail(rawOtp),
      });
    } catch (mailError) {
      console.error('Failed to send OTP email:', mailError?.message || mailError);
    }

    return res.status(200).json({
      success: true,
      message: isNewUser
        ? 'Account created successfully! Verification OTP sent to your email.'
        : 'OTP sent to your email! Please check your inbox.',
      isNewUser,
      otp: process.env.NODE_ENV === 'development' ? rawOtp : undefined,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify 6-digit OTP code and complete login / verification
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and 6-digit OTP code are required',
      });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+otp +otpExpires +refreshToken');

    if (!user || !user.otp || !user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code',
      });
    }

    // Check expiration
    if (new Date() > user.otpExpires) {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'OTP code has expired. Please request a new code.',
      });
    }

    // Verify OTP hash
    const hashedIncoming = hashToken(otp.trim());
    if (hashedIncoming !== user.otp) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect OTP code',
      });
    }

    // Mark verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    generateAccessToken(user, res);
    const refreshToken = generateRefreshToken(user, res);
    user.refreshToken = hashToken(refreshToken);

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      user: formatUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Google OAuth direct login
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required',
      });
    }

    const serverClientId = process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.trim() : undefined;

    let tokenAudience;
    try {
      const decoded = jwt.decode(credential);
      tokenAudience = decoded?.aud;
    } catch {
      // Ignore parse error, verifyIdToken will catch malformed token
    }

    const audiences = [serverClientId, tokenAudience].filter(Boolean);

    // Verify ID token using Google OAuth library with full RSA cert verification
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: audiences.length > 0 ? audiences : undefined,
      });
    } catch (verifyErr) {
      console.error('Google token verification failed:', verifyErr.message);
      return res.status(401).json({
        success: false,
        message: `Google token verification failed: ${verifyErr.message}`,
      });
    }

    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({
        success: false,
        message: 'Google authentication failed',
      });
    }

    const normalizedEmail = payload.email.toLowerCase().trim();
    let avatarUrl = payload.picture;
    if (payload.picture) {
      avatarUrl = await uploadUrlToCloudinary(payload.picture, 'avatars');
    }

    let user = await User.findOne({
      email: normalizedEmail,
    }).select('+refreshToken');

    if (!user) {
      user = await User.create({
        name: payload.name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        avatar: avatarUrl,
        provider: 'google',
        providerId: payload.sub,
        methods: ['google'],
        role: 'citizen',
        isVerified: true,
      });
    } else {
      if (!user.providerId) {
        user.provider = 'google';
        user.providerId = payload.sub;
      }

      if (user.methods && !user.methods.includes('google')) {
        user.methods.push('google');
      }

      if ((!user.name || user.name === normalizedEmail.split('@')[0]) && payload.name) {
        user.name = payload.name;
      }

      if (!user.avatar && avatarUrl) {
        user.avatar = avatarUrl;
      }

      user.isVerified = true;
    }

    generateAccessToken(user, res);
    const refreshToken = generateRefreshToken(user, res);
    user.refreshToken = hashToken(refreshToken);

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully via Google',
      user: formatUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }

    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || !user.refreshToken) {
      return res.status(403).json({
        success: false,
        message: 'User not found or refresh token revoked',
      });
    }

    const hashedIncoming = hashToken(token);

    if (hashedIncoming !== user.refreshToken) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token signature',
      });
    }

    const accessToken = generateAccessToken(user, res);

    return res.status(200).json({
      success: true,
      message: 'Access token refreshed successfully',
      accessToken,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user / clear cookies and stored refresh token
// @route   POST /api/auth/logout
// @access  Public / Protected
export const logout = async (req, res, next) => {
  try {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    // If user token/session present, remove stored refreshToken hash
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (token) {
      const hashedIncoming = hashToken(token);
      const user = await User.findOne({ refreshToken: hashedIncoming }).select('+refreshToken');
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    } else if (req.user) {
      const user = await User.findById(req.user._id).select('+refreshToken');
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: formatUserResponse(req.user),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/update-me
// @access  Private
export const updateMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.policyInsightOptIn !== undefined) {
      user.policyInsightOptIn = req.body.policyInsightOptIn === 'true' || req.body.policyInsightOptIn === true;
    }
    if (req.body.cscCenterId && user.role === 'csc_operator') {
      user.cscCenterId = req.body.cscCenterId;
    }
    if (req.body.ngoOrg && user.role === 'ngo_worker') {
      user.ngoOrg = req.body.ngoOrg;
    }
    if (req.body.assignedDistricts && user.role === 'ngo_worker') {
      user.assignedDistricts = Array.isArray(req.body.assignedDistricts) ? req.body.assignedDistricts : [req.body.assignedDistricts];
    }

    if (req.file) {
      const avatarUrl = await uploadToCloudinary(req.file.buffer);
      if (avatarUrl) {
        user.avatar = avatarUrl;
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: formatUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users: users.map(formatUserResponse),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user role & assigned meta (Admin only)
// @route   PATCH /api/auth/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, cscCenterId, ngoOrg, assignedDistricts } = req.body;

    const validRoles = ['citizen', 'csc_operator', 'ngo_worker', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Valid roles are: citizen, csc_operator, ngo_worker, admin',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (role) user.role = role;
    if (cscCenterId !== undefined) user.cscCenterId = cscCenterId;
    if (ngoOrg !== undefined) user.ngoOrg = ngoOrg;
    if (assignedDistricts !== undefined) user.assignedDistricts = Array.isArray(assignedDistricts) ? assignedDistricts : [assignedDistricts];

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User role and domain metadata updated successfully',
      user: formatUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
};
