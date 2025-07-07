
import { TournamentState, TournamentStructure } from '@/types/tournament'
import { Database } from '@/types/supabase'
interface SimpleRealtimeState {
  isConnected: boolean
  status: 'active' | 'paused' | 'error'
  error: string | null
  lastSync: number | null
  reconnect: () => void
}

export type Tournament = Database['public']['Tables']['tournaments']['Row']
export type TournamentStateDB = Database['public']['Tables']['tournament_states']['Row']

export interface SupabaseTournamentContextType {
  tournaments: Tournament[]
  currentTournament: TournamentState | null
  isLoading: boolean
  error: string | null
  isSupabaseConfigured: boolean
  createTournament: (structure: TournamentStructure, city: string) => Promise<string>
  joinTournament: (tournamentId: string) => Promise<void>
  updateTournamentState: (updates: Partial<TournamentState>) => Promise<void>
  leaveTournament: () => void
  loadTournaments: () => Promise<void>
  deleteTournament: (tournamentId: string) => Promise<void>
  realtimeConnection: SimpleRealtimeState
}
