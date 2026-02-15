const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const { auth } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validation');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../Services/Email/emailService');
const bcrypt = require('bcryptjs/dist/bcrypt');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};


router.post('/register', registerValidation, async (req, res) => {
  try {
    const { firstName, lastName, email, password , phone, address, postalCode, avatar } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }


    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      postalCode,
      avatar,
    });

    // Generate token
    const token = generateToken(user.id);

    // Send welcome email (don't wait for it to complete)
    sendWelcomeEmail(user.email, user.firstName).catch(emailError => {
      console.error('Failed to send welcome email:', emailError);
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully! Check your email for a welcome message.',
      data: {
        user: user.toAuthJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
});


router.post('/login', loginValidation, async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Find user with password field
    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // Check password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toAuthJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.toAuthJSON(),
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message,
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body;
    
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (address) {
      if (address.number) updateData.addressNumber = address.number;
      if (address.street) updateData.addressStreet = address.street;
      if (address.city) updateData.addressCity = address.city;
      if (address.country) updateData.addressCountry = address.country;
    }

    await req.user.update(updateData);
    await req.user.reload();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: req.user.toAuthJSON(),
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});


router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email: email } });
 
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, we\'ve sent a password reset link.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); 

    // Store reset token in user record
    await User.update(
      { 
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry 
      },
      { where: { id: user.id } }
    );

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(
      user.email, 
      user.firstName, 
      resetToken
    );

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again.',
      });
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, we\'ve sent a password reset link.',
    });

  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message,
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using token (from email link)
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Find user by reset token
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [require('sequelize').Op.gt]: new Date() // Token hasn't expired
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token',
      });
    }

    // Update user password and clear reset token
    await User.update(
      { 
        password: bcrypt.hashSync(newPassword, 10),
        resetPasswordToken: null,
        resetPasswordExpires: null 
      },
      { where: { id: user.id } }
    );

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message,
    });
  }
});

// @route   POST /api/auth/verify-reset-token
// @desc    Verify if reset token is valid (for frontend validation)
// @access  Public
router.post('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required',
      });
    }

    // Find user by reset token
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [require('sequelize').Op.gt]: new Date()  
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token',
      });
    }

    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        email: user.email,
        firstName: user.firstName
      }
    });

  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message,
    });
  }
});

module.exports = router;