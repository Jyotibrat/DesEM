const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { supabase, supabaseAdmin } = require('../config/supabase');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user with Supabase
// @access  Public
router.post('/register', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required')
], async (req, res, next) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password, name } = req.body;

        // Register user with Supabase
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email for development
            user_metadata: {
                name
            }
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        // Create user in our database
        const user = await User.create({
            supabaseId: data.user.id,
            email,
            username: email.split('@')[0],
            name,
            role: 'author'
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user,
                supabaseUser: data.user
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/login
// @desc    Login user with Supabase
// @access  Public
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Get or create user in our database
        let user = await User.findOne({ supabaseId: data.user.id });

        if (!user) {
            user = await User.create({
                supabaseId: data.user.id,
                email: data.user.email,
                username: data.user.email.split('@')[0],
                name: data.user.user_metadata?.name || data.user.email.split('@')[0],
                role: 'author'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                session: data.session,
                accessToken: data.session.access_token
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, async (req, res, next) => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: {
                user: req.user,
                supabaseUser: req.supabaseUser
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', protect, [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name } = req.body;

        // Update in Supabase
        if (name) {
            const { error } = await supabaseAdmin.auth.admin.updateUserById(
                req.user.supabaseId,
                {
                    user_metadata: { name }
                }
            );

            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
        }

        // Update in our database
        const updateData = {};
        if (name) updateData.name = name;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', protect, [
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { newPassword } = req.body;

        // Update password in Supabase
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
            req.user.supabaseId,
            {
                password: newPassword
            }
        );

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', async (req, res, next) => {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        const { data, error } = await supabase.auth.refreshSession({
            refresh_token
        });

        if (error) {
            return res.status(401).json({
                success: false,
                message: error.message
            });
        }

        res.json({
            success: true,
            data: {
                session: data.session,
                accessToken: data.session.access_token
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
