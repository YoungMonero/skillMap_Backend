import { supabaseClient } from '../config/supabaseClient.js';

export const refreshSession = async (req, res) => {
  const { refreshToken } = req.body;

  const { data, error } = await supabaseClient.auth.refreshSession({ refresh_token: refreshToken });
  if (error) return res.status(401).json({ error: 'Session expired, please log in again' });

  res.json({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  });
};