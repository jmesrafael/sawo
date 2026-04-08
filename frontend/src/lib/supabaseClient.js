// src/lib/supabaseClient.js
// Only used by the public frontend (e.g. fetching published products).
// The admin panel uses the Express API instead.
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);
