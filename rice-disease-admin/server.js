const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/diseases', require('./routes/diseases'));
app.use('/api/detections', require('./routes/detections'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/evaluations', require('./routes/evaluations'));

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});
app.use(require('./middleware/errorHandler'));

// Protect static admin pages except login
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.redirect('/index.html'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Admin running at http://localhost:${PORT}`);
});