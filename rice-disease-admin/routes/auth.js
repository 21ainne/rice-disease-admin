const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password, platform } = req.body; 
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    // ADDED status TO THE SELECT QUERY
    const [rows] = await pool.query(
      'SELECT *, status FROM users WHERE username = ? AND is_active = 1',
      [username]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // --- NEW: CHECK IF SUSPENDED ---
    if (user.status === 'Suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact the Admin.' });
    }
    // -------------------------------

    // --- SEPARATION LOGIC ---
    if (platform === 'web' && user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied. Only Admins can log in to the web portal.' });
    }
    
    if (platform === 'mobile' && user.role === 'Admin') {
      return res.status(403).json({ error: 'Admins cannot log in to the mobile app. Please use the web portal.' });
    }
    // ------------------------

    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    
    res.json({ 
      message: 'Login successful', 
      token: token, 
      user: { full_name: user.full_name, role: user.role } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// --- NEW ROUTE: Mobile App Registration ---
router.post('/register', async (req, res) => {
  const { full_name, username, password, contact_number, barangay } = req.body;

  if (!full_name || !username || !password) {
    return res.status(400).json({ error: 'Full name, username, and password are required' });
  }

  try {
    const [existing] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (full_name, username, password_hash, role, contact_number, barangay) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, username, hash, 'Farmer', contact_number || null, barangay || null]
    );

    res.status(201).json({ message: 'Account created successfully! You can now login.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// --- NEW ROUTE: Admin Registration ---
router.post('/register-admin', async (req, res) => {
  const { full_name, username, password, admin_id } = req.body;

  if (admin_id !== process.env.ADMIN_SECRET_ID) {
    return res.status(403).json({ error: 'Invalid Admin Identification ID' });
  }

  if (!full_name || !username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const [existing] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existing.length > 0) return res.status(409).json({ error: 'Username already taken' });

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (full_name, username, password_hash, role) VALUES (?, ?, ?, ?)',
      [full_name, username, hash, 'Admin']
    );

    res.status(201).json({ message: 'Admin account created successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;