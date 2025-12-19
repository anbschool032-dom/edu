// // carrear-server/middleware/auth.middleware.js
// const jwt = require('jsonwebtoken');

// const authMiddleware = (req, res, next) => {
//     // 1. Check for Authorization header
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res.status(401).json({ message: 'Access denied. No token provided.' });
//     }

//     const token = authHeader.split(' ')[1];

//     try {
//         // 2. Verify Access Token
//         const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        
//         // 3. Attach user info (ID, Role) to the request for controller use
//         req.user = decoded; 
        
//         next();

//     } catch (error) {
//         // If token is expired, the client should use the Refresh Token endpoint
//         return res.status(401).json({ message: 'Invalid or expired access token.' });
//     }
// };

// module.exports = authMiddleware;



const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (roles.length && !roles.includes(decoded.role_name)) {
      return res.status(403).json({ message: 'Insufficient permissions.' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired access token.' });
  }
};

module.exports = authMiddleware;