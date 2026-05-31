// ALWAYS import supabase from here
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wljecfqzxvojsypqbkzp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsamVjZnF6eHZvanN5cHFia3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNTg5MzIsImV4cCI6MjA5NTgzNDkzMn0.DXa7tAeiGX0eyGoCcY0_1DTrMJi3-zh8TjDCZxUv35A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});