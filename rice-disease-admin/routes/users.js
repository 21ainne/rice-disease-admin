const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();
router.use(verifyToken, requireAdmin);

router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT user_id, full_name, username, role, contact_number, barangay, is_active, created_at FROM users ORDER BY user_id DESC'
  );
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { full_name, username, password, role, contact_number, barangay } = req.body;
  if (!full_name || !username || !password) {
    return res.status(400).json({ error: 'Full name, username, and password are required' });
  }

  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (full_name, username, password_hash, role, contact_number, barangay) VALUES (?, ?, ?, ?, ?, ?)',
    [full_name, username, hash, role || 'Farmer', contact_number || null, barangay || null]
  );
  res.status(201).json({ user_id: result.insertId });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { full_name, username, role, contact_number, barangay, is_active, password } = req.body;
  if (!full_name || !username) {
    return res.status(400).json({ error: 'Full name and username are required' });
  }

  let query = 'UPDATE users SET full_name=?, username=?, role=?, contact_number=?, barangay=?, is_active=?';
  const params = [full_name, username, role, contact_number || null, barangay || null, is_active];
  if (password) {
    query += ', password_hash=?';
    params.push(await bcrypt.hash(password, 10));
  }
  query += ' WHERE user_id=?';
  params.push(req.params.id);
  const [result] = await pool.query(query, params);
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ message: 'User updated' });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  if (Number(req.params.id) === Number(req.user.user_id)) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  const [result] = await pool.query('DELETE FROM users WHERE user_id=?', [req.params.id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ message: 'User deleted' });
}));

module.exports = router;
