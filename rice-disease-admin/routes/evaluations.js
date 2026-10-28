const express = require('express');
const pool = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', verifyToken, requireAdmin, asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT er.*, u.full_name, u.role
    FROM evaluation_responses er
    JOIN users u ON er.user_id = u.user_id
    ORDER BY er.date_submitted DESC LIMIT 500
  `);
  res.json(rows);
}));

router.post('/', verifyToken, asyncHandler(async (req, res) => {
  const { evaluation_criterion, rating_score } = req.body;
  const criterion = typeof evaluation_criterion === 'string' ? evaluation_criterion.trim() : '';
  const rating = Number(rating_score);

  if (!criterion || criterion.length > 120 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'A criterion and a whole-number rating from 1 to 5 are required' });
  }

  const [result] = await pool.query(
    'INSERT INTO evaluation_responses (user_id, evaluation_criterion, rating_score) VALUES (?, ?, ?)',
    [req.user.user_id, criterion, rating]
  );
  res.status(201).json({ response_id: result.insertId });
}));

module.exports = router;