
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// For now, we'll create a mock client if no env vars are provided
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = isConfigured ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
}) : null;

// Helper function to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return isConfigured;
}

// Helper function to generate unique access codes
export function generateAccessCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Helper function to get current user ID (for anonymous users)
export async function getCurrentUserId(): Promise<string> {
  if (!supabase) {
    return 'demo-user-' + Math.random().toString(36).substring(2, 8);
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Sign in anonymously if no user
      const { data: { user: anonUser }, error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      return anonUser?.id || 'anonymous'
    }
    
    return user.id
  } catch (error) {
    console.error('Error getting user ID:', error);
    return 'demo-user-' + Math.random().toString(36).substring(2, 8);
  }
}
