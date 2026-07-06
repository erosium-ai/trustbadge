import { createClient } from "@supabase/supabase-js";

function getEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { supabaseUrl, supabaseKey, serviceRoleKey };
}

let publicClient: ReturnType<typeof createClient> | null = null;

export function getPublicClient() {
  if (publicClient) return publicClient;

  const { supabaseUrl, supabaseKey } = getEnv();
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase public env vars are missing");
  }

  publicClient = createClient(supabaseUrl, supabaseKey);
  return publicClient;
}

export function getServiceClient() {
  const { supabaseUrl, serviceRoleKey } = getEnv();
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase service role env vars are missing");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
