import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '[config/supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
    'Copy .env.example to .env and fill in your Supabase project credentials.'
  );
}

// The backend always uses the service-role key so it can enforce its own
// authorization logic (see middleware/auth.js) while Row Level Security in
// Postgres remains the last line of defense if this key is ever misused.
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'generated-images';
