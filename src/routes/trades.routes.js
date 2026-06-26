// src/routes/trades.routes.js
import express from 'express';
import { supabaseAdmin } from '../config/supabaseAdmin.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('trades').select('*').order('name');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;