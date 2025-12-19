// carrear-server/middleware/role.middleware.js
const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
        // req.user is set by authMiddleware
        if (!req.user || req.user.role_name !== requiredRole) {
            return res.status(403).json({ message: 'Forbidden. Insufficient permissions.' });
        }
        next();
    };
};

module.exports = roleMiddleware;