import { supabaseClient } from '../config/supabaseClient.js';
import { supabaseAdmin } from '../config/supabaseAdmin.js';

export const registerCustomer = async (req, res) => {
  const { name, email, password, lat, lng } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skips email confirmation for now during dev
    app_metadata: { role: 'customer' },
  });
  if (authError) return res.status(400).json({ error: authError.message });

  const userId = authData.user.id;

  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: userId, role: 'customer', name, email,
  });
  if (profileError) return res.status(500).json({ error: profileError.message });

  if (lat && lng) {
    await supabaseAdmin.from('customer_profiles').insert({
      user_id: userId, current_location: `POINT(${lng} ${lat})`,
    });
  }

  const { data: session, error: sessionError } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (sessionError) return res.status(500).json({ error: sessionError.message });

  res.json({
    accessToken: session.session.access_token,
    refreshToken: session.session.refresh_token,
    user: { id: userId, name, email, role: 'customer' },
  });
};

export const loginCustomer = async (req, res) => {
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