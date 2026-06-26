import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

export const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY,
  { realtime: { transport: ws } }
);