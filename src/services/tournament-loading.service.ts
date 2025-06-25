
import { supabase } from '@/lib/supabase'
import { Tournament } from '@/types/tournament-context'

export class TournamentLoadingService {
  static async loadTournaments(): Promise<Tournament[]> {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Convert the raw Supabase data to our Tournament type with proper type casting
    return (data || []).map(tournament => ({
      id: tournament.id,
      name: tournament.name,
      buy_in: tournament.buy_in,
      reentry_fee: tournament.reentry_fee,
      guaranteed_prize_pool: tournament.guaranteed_prize_pool,
      initial_stack: tournament.initial_stack,
      levels: tournament.levels as any, // Type assertion for JSONB field
      break_after_levels: tournament.break_after_levels,
      payout_structure: tournament.payout_structure as any, // Type assertion for JSONB field
      status: tournament.status as "created" | "active" | "paused" | "finished", // Properly cast status
      created_by: tournament.created_by,
      created_at: tournament.created_at,
      city: tournament.city,
      access_code: tournament.access_code
    }))
  }
}
