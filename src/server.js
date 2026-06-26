import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.router.js';
import tradesRoutes from './routes/trades.routes.js';
import workersRoutes from './routes/workers.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SkillMap backend is running' });
});

app.use('/api/auth', authRoutes);

app.use('/api/trades', tradesRoutes);

app.use('/api/workers', workersRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SkillMap backend running on port ${PORT}`);
});