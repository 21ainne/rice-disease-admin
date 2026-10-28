const express = require('express');
const pool = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();
router.use(verifyToken, requireAdmin);

function validRecommendation(diseaseId, treatmentText) {
  return Number.isInteger(Number(diseaseId))
    && Number(diseaseId) > 0
    && typeof treatmentText === 'string'
    && treatmentText.trim().length > 0;
}

router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT r.*, d.disease_name FROM recommendations r
    JOIN diseases d ON r.disease_id = d.disease_id
    ORDER BY r.recommendation_id DESC
  `);
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { disease_id, treatment_text, pesticide_fertilizer_guide, source_reference } = req.body;
  if (!validRecommendation(disease_id, treatment_text)) {
    return res.status(400).json({ error: 'A valid disease and treatment text are required' });
  }
  const [result] = await pool.query(
    'INSERT INTO recommendations (disease_id, treatment_text, pesticide_fertilizer_guide, source_reference) VALUES (?,?,?,?)',
    [disease_id, treatment_text.trim(), pesticide_fertilizer_guide || null, source_reference || null]
  );
  res.status(201).json({ recommendation_id: result.insertId });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { disease_id, treatment_text, pesticide_fertilizer_guide, source_reference } = req.body;
  if (!validRecommendation(disease_id, treatment_text)) {
    return res.status(400).json({ error: 'A valid disease and treatment text are required' });
  }
  await pool.query(
    'UPDATE recommendations SET disease_id=?, treatment_text=?, pesticide_fertilizer_guide=?, source_reference=? WHERE recommendation_id=?',
    [disease_id, treatment_text.trim(), pesticide_fertilizer_guide, source_reference, req.params.id]
  );
  res.json({ message: 'Recommendation updated' });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM recommendations WHERE recommendation_id=?', [req.params.id]);
  res.json({ message: 'Recommendation deleted' });
}));

module.exports = router;