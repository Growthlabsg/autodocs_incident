// src/middleware/auth.js
// Authentication Middleware

const { verifyAccessToken } = require('../config/jwt');
const { query } = require('../config/database');

// Protect routes - require authentication
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Check for token in cookies
        else if (req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = verifyAccessToken(token);

            // Get user from database
            const result = await query(
                'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = $1',
                [decoded.userId]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const user = result.rows[0];

            if (!user.is_active) {
                return res.status(401).json({
                    success: false,
                    message: 'User account is inactive'
                });
            }

            // Attach user to request
            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error during authentication'
        });
    }
};

// Authorize specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
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

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.token) {
            token = req.cookies.token;
        }

        if (token) {
            try {
                const decoded = verifyAccessToken(token);
                const result = await query(
                    'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1',
                    [decoded.userId]
                );

                if (result.rows.length > 0) {
                    req.user = result.rows[0];
                }
            } catch (error) {
                // Token invalid, but continue anyway
            }
        }

        next();
    } catch (error) {
        next();
    }
};

module.exports = {
    protect,
    authorize,
    optionalAuth
};
