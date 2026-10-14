import User from '../models/User.js';
import { extractCitizenProfile } from '../services/ai/profileExtractionService.js';
import { extractedProfileSchema } from '../validations/profileValidation.js';
import { uploadToCloudinary } from '../middlewares/uploadMiddleware.js';

// @desc    Extract candidate citizen profile facts from natural language text
// @route   POST /api/profile/ai-fill
// @access  Private
export const aiFillProfile = async (req, res, next) => {
  try {
    const { text } = req.body;

    const result = await extractCitizenProfile(text);

    return res.status(200).json({
      success: true,
      data: {
        extracted: result.extracted,
        missingFields: result.missingFields,
        conflicts: result.conflicts,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Confirm and update citizen profile details in User model
// @route   PATCH /api/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const validatedData = extractedProfileSchema.partial().parse(req.body);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    // Apply validated profile fields to user document
    Object.assign(user, validatedData);
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;
    delete userObj.otp;
    delete userObj.otpExpires;

    return res.status(200).json({
      success: true,
      message: 'Citizen profile updated successfully',
      user: userObj,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload citizen profile avatar image to Cloudinary
// @route   POST /api/profile/avatar
// @access  Private
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload',
      });
    }

    const avatarUrl = await uploadToCloudinary(req.file.buffer, 'avatars');

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    user.avatar = avatarUrl;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;
    delete userObj.otp;
    delete userObj.otpExpires;

    return res.status(200).json({
      success: true,
      message: 'Profile avatar uploaded successfully to Cloudinary',
      avatar: avatarUrl,
      user: userObj,
    });
    
  } catch (err) {
    next(err);
  }
};

// @desc    Permanently delete citizen user account
// @route   DELETE /api/profile
// @access  Private
export const deleteAccount = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || email.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Provided email does not match your account email address',
      });
    }

    await User.findByIdAndDelete(req.user._id);

    // Clear authentication cookies
    res.cookie('accessToken', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    return res.status(200).json({
      success: true,
      message: 'Account permanently deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
