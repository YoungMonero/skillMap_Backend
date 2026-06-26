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

export const getWorkerProfile = async (req, res) => {
  const { id } = req.params;

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles').select('id, name, profile_image_url').eq('id', id).single();
  if (profileError || !profile) return res.status(404).json({ error: 'Worker not found' });

  const { data: workerProfile, error: workerError } = await supabaseAdmin
    .from('worker_profiles').select('*').eq('user_id', id).single();
  if (workerError || !workerProfile) return res.status(404).json({ error: 'Worker profile not found' });

  const { data: skills } = await supabaseAdmin
    .from('worker_skills').select('trade_id, trades(id, name, icon)').eq('worker_id', id);

  const { data: portfolio } = await supabaseAdmin
    .from('worker_portfolio').select('id, image_url, title, description')
    .eq('worker_id', id).order('created_at', { ascending: false }).limit(12);

  const { data: reviews } = await supabaseAdmin
    .from('reviews').select('id, rating, comment, created_at, customer_id')
    .eq('worker_id', id).order('created_at', { ascending: false }).limit(20);

  let reviewsWithNames = [];
  if (reviews && reviews.length > 0) {
    const customerIds = reviews.map((r) => r.customer_id);
    const { data: reviewers } = await supabaseAdmin.from('profiles').select('id, name').in('id', customerIds);
    reviewsWithNames = reviews.map((r) => ({
      ...r,
      customer_name: reviewers?.find((p) => p.id === r.customer_id)?.name || 'Anonymous',
    }));
  }

  res.json({
    id: profile.id,
    name: profile.name,
    profile_image_url: profile.profile_image_url,
    bio: workerProfile.bio,
    years_experience: workerProfile.years_experience,
    whatsapp_number: workerProfile.whatsapp_number,
    rating_avg: workerProfile.rating_avg,
    jobs_completed: workerProfile.jobs_completed,
    availability_status: workerProfile.availability_status,
    services: workerProfile.services || [],
    location_label: workerProfile.location_label,
    trades: skills?.map((s) => s.trades) || [],
    portfolio: portfolio || [],
    reviews: reviewsWithNames,
    review_count: reviewsWithNames.length,
  });
};