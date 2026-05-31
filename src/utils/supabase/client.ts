// ALWAYS import supabase from here
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cjteefcgtjvgxephwznm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqdGVlZmNndGp2Z3hlcGh3em5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTYxNTksImV4cCI6MjA5MzczMjE1OX0.U9BvJx4q_3Ah_G1BbCHGgQ2qjCW6ooG5YJQKgvFKJwY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});