const { supabaseAdmin } = require('../config/supabase');
const User = require('../models/User');

// Protect routes - verify Supabase JWT token
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Please provide a valid token.'
            });
        }

        try {
            // Verify token with Supabase
            const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

            if (error || !user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired token'
                });
            }

            // Get user from our database using Supabase user ID
            let dbUser = await User.findOne({ supabaseId: user.id }).select('-password');

            // If user doesn't exist in our DB, create them
            if (!dbUser) {
                dbUser = await User.create({
                    supabaseId: user.id,
                    email: user.email,
                    username: user.email.split('@')[0], // Use email prefix as username
                    name: user.user_metadata?.name || user.email.split('@')[0],
                    role: 'author', // Default role
                    isActive: true
                });
            }

            // Attach user to request
            req.user = dbUser;
            req.supabaseUser = user; // Also attach Supabase user for reference

            next();
        } catch (error) {
            console.error('Auth error:', error);
            return res.status(401).json({
                success: false,
                message: 'Authentication failed'
            });
        }
    } catch (error) {
        next(error);
    }
};

// Authorize specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};
