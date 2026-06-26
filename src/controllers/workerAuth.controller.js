import { supabaseClient } from '../config/supabaseClient.js';
import { supabaseAdmin } from '../config/supabaseAdmin.js';

export const registerWorker = async (req, res) => {
  const { name, email, password, trade_id, whatsapp_number, lat, lng } = req.body;
  if (!name || !email || !password || !trade_id) {
    return res.status(400).json({ error: 'Name, email, password, and trade are required' });
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: 'worker' },
  });
  if (authError) return res.status(400).json({ error: authError.message });

  const userId = authData.user.id;

  await supabaseAdmin.from('profiles').insert({ id: userId, role: 'worker', name, email });

  await supabaseAdmin.from('worker_profiles').insert({
    user_id: userId,
    trade_id,
    whatsapp_number,
    current_location: lat && lng ? `POINT(${lng} ${lat})` : null,
  });

  const { data: session, error: sessionError } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (sessionError) return res.status(500).json({ error: sessionError.message });

  res.json({
    accessToken: session.session.access_token,
    refreshToken: session.session.refresh_token,
    user: { id: userId, name, email, role: 'worker' },
  });
};

export const loginWorker = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: 'Invalid email or password' });

  const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', data.user.id).single();

  res.json({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user: profile,
  });
};