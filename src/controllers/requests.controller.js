import { supabaseAdmin } from '../config/supabaseAdmin.js';

export const createRequest = async (req, res) => {
  const { worker_id, trade_id, title, description, budget_min, budget_max, lat, lng } = req.body;

  if (!worker_id || !trade_id || !title) {
    return res.status(400).json({ error: 'worker_id, trade_id, and title are required' });
  }

  const { data, error } = await supabaseAdmin
    .from('service_requests')
    .insert({
      customer_id: req.user.id,
      worker_id,
      trade_id,
      title,
      description,
      budget_min,
      budget_max,
      location: lat && lng ? `POINT(${lng} ${lat})` : null,
      status: 'open',
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const getWorkerRequests = async (req, res) => {
  const { data: requests, error } = await supabaseAdmin
    .from('service_requests')
    .select('*')
    .eq('worker_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  if (!requests || requests.length === 0) return res.json([]);

  const customerIds = requests.map((r) => r.customer_id);
  const { data: customers } = await supabaseAdmin.from('profiles').select('id, name').in('id', customerIds);

  const enriched = requests.map((r) => ({
    ...r,
    customer_name: customers?.find((c) => c.id === r.customer_id)?.name || 'Customer',
  }));

  res.json(enriched);
};

export const respondToRequest = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  if (!['accept', 'decline'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }

  const newStatus = action === 'accept' ? 'assigned' : 'cancelled';

  const { data, error } = await supabaseAdmin
    .from('service_requests')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('worker_id', req.user.id) // worker can only respond to their own requests
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};