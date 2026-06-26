import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws },
  }
);