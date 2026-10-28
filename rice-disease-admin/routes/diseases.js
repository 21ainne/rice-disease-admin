const express = require('express');
const pool = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();
router.use(verifyToken, requireAdmin);

const categories = ['Fungal', 'Bacterial', 'Viral', 'Insect Pest', 'Healthy'];

router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM diseases ORDER BY disease_id DESC');
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { disease_name, category, description, glcm_feature_profile } = req.body;
  if (!disease_name || !categories.includes(category)) {
    return res.status(400).json({ error: 'A disease name and valid category are required' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO diseases (disease_name, category, description, glcm_feature_profile) VALUES (?,?,?,?)',
      [disease_name, category, description || null, glcm_feature_profile || null]
    );
    res.status(201).json({ disease_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Disease already exists' });
    res.status(500).json({ error: 'Server error' });
  }
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { disease_name, category, description, glcm_feature_profile } = req.body;
  if (!disease_name || !categories.includes(category)) {
    return res.status(400).json({ error: 'A disease name and valid category are required' });
  }
  await pool.query(
    'UPDATE diseases SET disease_name=?, category=?, description=?, glcm_feature_profile=? WHERE disease_id=?',
    [disease_name, category, description, glcm_feature_profile, req.params.id]
  );
  res.json({ message: 'Disease updated' });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM diseases WHERE disease_id=?', [req.params.id]);
  res.json({ message: 'Disease deleted' });
}));

module.exports = router;