const {
  generateToken,
  generateRefreshToken,
} = require('../middlewares/auth.middleware');
const { authModel, userModel, refreshTokenModel } = require('../models');
const generateOTP = require('../utils/generateOTP');
const bcrypt = require('bcrypt');
const { emailService } = require('../services');
const jwt = require('jsonwebtoken');

const signupUser = async (req, res) => {
  try {
    const query = {
      email: req.body.email,
      isDeleted: false,
      isVerified: true,
    };
    const userExist = await userModel.findOne(query);
    if (userExist) {
      return res.status(400).send({
        message: 'Email already registered.',
        data: {},
      });
    }
    const queryUser = {
      email: req.body.email,
      isDeleted: false,
      isVerified: false,
    };
    const userExistNotVerified = await userModel.findOne(queryUser);
    const emailDetails = {
      email: req.body.email,
      otp: generateOTP(),
      name: req.body.name,
    };

    await emailService.sendSignupEmail(emailDetails);
    await authModel.findOneAndDelete({ email: emailDetails.email });
    await authModel.create({
      email: emailDetails.email,
      otp: emailDetails.otp,
    });
    if (userExistNotVerified) {
      await userModel.updateOne({ email: req.body.email }, req.body);
      return res.status(201).send({
        message: 'Verify Pin sent to email please verify email',
      });
    }
    await userModel.create(req.body);
    return res.status(201).send({
      message: 'Verify Pin sent to email please verify email',
    });
  } catch (error) {
    return res.status(500).send({
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const query = {
      email: req.body.email,
      isVerified: true,
      isDeleted: false,
    };
    const user = await userModel.findOne(query);
    if (!user) {
      return res.status(404).send({
        message: 'User not exits',
        data: {},
      });
    }
    const isPasswordMatched = await bcrypt.compare(
      req.body.password,
      user.password,
    );
    if (!isPasswordMatched) {
      return res.status(400).send({
        message: 'incorrect credential',
        data: {},
      });
    }
    const token = await generateToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);
    return res.status(200).send({
      message: 'Logged in successfully',
      data: { token: token, refreshToken: refreshToken },
    });
  } catch (error) {
    return res.status(500).send({
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const query = { email: req.body.email, isVerified: true, isDeleted: false };
    const user = await userModel.findOne(query);
    if (!user) {
      return res.status(404).send({
        message: 'User Not found',
        data: {},
      });
    }

    const emailDetails = {
      email: req.body.email,
      otp: generateOTP(),
      name: user.name,
    };

    await emailService.sendForgotEmail(emailDetails);
    await authModel.findOneAndDelete({ email: emailDetails.email });
    await authModel.create({
      email: emailDetails.email,
      otp: emailDetails.otp,
    });
    return res.status(200).send({
      message: 'User Found and Pin sent to email',
      data: {},
    });
  } catch (error) {
    return res.status(500).send({
      error: error.message,
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const query = { email: req.body.email, isDeleted: false };
    const user = await userModel.findOne(query);
    if (!user) {
      return res.status(404).send({
        message: 'User not found',
        data: {},
      });
    }
    const authOTP = await authModel.findOne({ email: req.body.email });
    if (!authOTP) {
      return res.status(400).send({
        message: 'OTP expired',
        data: {},
      });
    }

    if (Number(req.body.otp) !== authOTP.otp) {
      return res.status(400).send({
        message: 'Invalid OTP',
        data: {},
      });
    }
    const token = await generateToken(user._id);
    await userModel.updateOne(
      { _id: user._id },
      { $set: { isVerified: true } },
    );
    return res.status(200).send({
      message: 'OTP verified successfully',
      data: { token: token },
    });
  } catch (error) {
    return res.status(500).send({
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).send({
        message: 'New Password and Confirm Password are not matched',
        data: {},
      });
    }
    await userModel.findByIdAndUpdate(req.user.id, {
      password: req.body.password,
    });
    return res.status(200).send({
      message: 'Password reset successfully',
      data: {},
    });
  } catch (error) {
    return res.status(500).send({
      error: error.message,
    });
  }
};

const verifyToken = async (req, res) => {
  const user = await userModel.findById(req.user.id).select('-password');
  return res.status(200).send({
    message: 'Token verified',
    data: user,
  });
};

const updatePassword = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    const matched = await bcrypt.compare(
      req.body.currentPassword,
      user.password,
    );
    if (!matched) {
      return res.status(400).send({
        message: 'Password not matched',
        data: {},
      });
    }
    if (req.body.newPassword !== req.body.confirmPassword) {
      return res.status(400).send({
        message: 'New Password and Confirm Password are not matched',
        data: {},
      });
    }
    const emailDetails = {
      email: user.email,
      name: user.name,
    };
    await emailService.sendUpdatePasswordEmail(emailDetails);
    user.password = req.body.newPassword;
    await user.save();
    return res.status(200).send({
      message: 'Password updated successfully',
      data: {},
    });
  } catch (error) {
    return res.status(500).send({
      error: error.message,
    });
  }
};

const updateEmail = async (req, res) => {
  try {
    const query = { email: req.body.newEmail, isDeleted: false };
    const userExist = await userModel.findOne(query);
    if (userExist) {
      return res.status(400).send({
        message: 'Email already registered.',
        data: {},
      });
    }
    const currentUser = await userModel.findById(req.user.id);
    const isPasswordMatched = await bcrypt.compare(
      req.body.password,
      currentUser.password,
    );
    if (!isPasswordMatched) {
      return res.status(400).send({
        message: 'Incorrect password',
        data: {},
      });
    }
    const emailDetails = {
      email: currentUser.email,
      name: currentUser.name,
      newEmail: req.body.newEmail,
    };

    await emailService.sendUpdateEmail(emailDetails);

    const user = await userModel
      .findByIdAndUpdate(
        req.user.id,
        { email: req.body.newEmail },
        { new: true },
      )
      .select('-password');
    return res.status(200).send({
      message: 'Email updated successfully',
      data: { user },
    });
  } catch (error) {
    return res.status(500).send({
      error: error.message,
    });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).send({ message: 'Refresh token is required' });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const tokenDoc = await refreshTokenModel.findOne({
      token: refreshToken,
      userId: decoded.id,
    });

    if (!tokenDoc) {
      return res.status(401).send({ message: 'Invalid refresh token.' });
    }

    const newToken = generateToken(decoded.id);
    const newRefreshToken = await generateRefreshToken(decoded.id);

    await refreshTokenModel.findByIdAndDelete(tokenDoc._id);

    return res.status(200).send({
      message: 'Token refreshed successfully',
      data: { token: newToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    return res.status(401).send({ message: 'Invalid refresh token' });
  }
};

module.exports = {
  signupUser,
  loginUser,
  verifyOTP,
  verifyToken,
  forgotPassword,
  updatePassword,
  resetPassword,
  updateEmail,
  refreshToken,
};
