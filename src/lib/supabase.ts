
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/integrations/supabase/types'

const supabaseUrl = 'https://ohvboilegetblfwjipsq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9odmJvaWxlZ2V0Ymxmd2ppcHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDcyNTksImV4cCI6MjA2NjQyMzI1OX0.cK4KHKBh6a5Kyyx2O0iLMRkcWA8_SdeKFxhwMjfFNdU'

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase configured: true');

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'poker-tournament-auth'
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Helper function to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return true;
}

// Helper function to generate unique access codes
export function generateAccessCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Helper function to get current user ID (for authenticated users)
export async function getCurrentUserId(): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }
    
    return user.id
  } catch (error) {
    console.error('Error getting user ID:', error);
    throw error;
  }
}
