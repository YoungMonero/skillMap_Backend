require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health check — proves the server is alive and reachable
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SkillMap backend is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SkillMap backend running on port ${PORT}`);
});