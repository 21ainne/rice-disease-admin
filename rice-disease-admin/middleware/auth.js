const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  // Check for cookie (Web) OR Authorization header (Mobile)
  let token = req.cookies.token;
  
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'Admin') return next();
  return res.status(403).json({ error: 'Admin access required' });
}

module.exports = { verifyToken, requireAdmin };