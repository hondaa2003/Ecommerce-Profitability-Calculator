import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "cjteefcgtjvgxephwznm";
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqdGVlZmNndGp2Z3hlcGh3em5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTYxNTksImV4cCI6MjA5MzczMjE1OX0.U9BvJx4q_3Ah_G1BbCHGgQ2qjCW6ooG5YJQKgvFKJwY";

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
