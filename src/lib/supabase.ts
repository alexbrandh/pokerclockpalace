
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Helper function to generate unique access codes
export function generateAccessCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Helper function to get current user ID (for anonymous users)
export async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // Sign in anonymously if no user
    const { data: { user: anonUser }, error } = await supabase.auth.signInAnonymously()
    if (error) throw error
    return anonUser?.id || 'anonymous'
  }
  
  return user.id
}
