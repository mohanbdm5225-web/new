import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawUrl || !serviceRoleKey) {
    return null;
  }

  const url = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
