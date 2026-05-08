import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      { auth: { persistSession: true, autoRefreshToken: true } },
    );
  }
  return client;
}
