import { supabaseAdmin } from '../config/supabaseAdmin.js';

export const getNearbyWorkers = async (req, res) => {
  const { lat, lng, radius = 5000, trade_id } = req.query;

  if (!lat || !lng || !trade_id) {
    return res.status(400).json({ error: 'lat, lng, and trade_id are required' });
  }

  const { data, error } = await supabaseAdmin.rpc('nearby_workers', {
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    radius_m: parseInt(radius, 10),
    trade: parseInt(trade_id, 10),
  });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const updateAvailability = async (req, res) => {
  const { status, lat, lng } = req.body;

  if (!['available', 'busy', 'offline'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const updates = { availability_status: status };
  if (lat && lng) {
    updates.current_location = `POINT(${lng} ${lat})`;
    updates.location_updated_at = new Date().toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from('worker_profiles')
    .update(updates)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const updateLocation = async (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng are required' });

  const { error } = await supabaseAdmin
    .from('worker_profiles')
    .update({
      current_location: `POINT(${lng} ${lat})`,
      location_updated_at: new Date().toISOString(),
    })
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Location updated' });
};