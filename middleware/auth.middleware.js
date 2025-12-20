// // // carrear-server/middleware/auth.middleware.js
// // const jwt = require('jsonwebtoken');

// // const authMiddleware = (req, res, next) => {
// //     // 1. Check for Authorization header
// //     const authHeader = req.headers.authorization;
// //     if (!authHeader || !authHeader.startsWith('Bearer ')) {
// //         return res.status(401).json({ message: 'Access denied. No token provided.' });
// //     }

// //     const token = authHeader.split(' ')[1];

// //     try {
// //         // 2. Verify Access Token
// //         const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        
// //         // 3. Attach user info (ID, Role) to the request for controller use
// //         req.user = decoded; 
        
// //         next();

// //     } catch (error) {
// //         // If token is expired, the client should use the Refresh Token endpoint
// //         return res.status(401).json({ message: 'Invalid or expired access token.' });
// //     }
// // };

// // module.exports = authMiddleware;



// const jwt = require('jsonwebtoken');

// const authMiddleware = (roles = []) => (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ message: 'Access denied. No token provided.' });
//   }
//   const token = authHeader.split(' ')[1];
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
//     if (roles.length && !roles.includes(decoded.role_name)) {
//       return res.status(403).json({ message: 'Insufficient permissions.' });
//     }
//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: 'Invalid or expired access token.' });
//   }
// };

// module.exports = authMiddleware;

// middleware/auth.middleware.js








// // middleware/auth.middleware.js
// const jwt = require('jsonwebtoken');
// const db = require('../models');
// const User = db.User;

// const authMiddleware = (roles = []) => {
//   return async (req, res, next) => {
//     try {
//       const authHeader = req.headers.authorization;
//       if (!authHeader?.startsWith('Bearer ')) {
//         return res.status(401).json({ message: 'No token provided.' });
//       }

//       const token = authHeader.split(' ')[1];
//       const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

//       const user = await User.findByPk(decoded.id);
//       if (!user || user.status !== 'active') {
//         return res.status(401).json({ message: 'Invalid user.' });
//       }

//       if (roles.length && !roles.includes(user.role_name)) {
//         return res.status(403).json({ message: 'Forbidden' });
//       }

//       req.user = {
//         id: user.id,
//         email: user.email,
//         role_name: user.role_name,
//       };

//       next();
//     } catch (err) {
//       return res.status(401).json({ message: 'Invalid or expired token.' });
//     }
//   };
// };

// module.exports = authMiddleware;


const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

const authMiddleware = (roles = []) => async (req,res,next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user || user.status !== 'active') return res.status(401).json({ message: 'Invalid user' });

    if (roles.length && !roles.includes(user.role_name)) return res.status(403).json({ message: 'Forbidden' });

    req.user = { id: user.id, email: user.email, role_name: user.role_name };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
