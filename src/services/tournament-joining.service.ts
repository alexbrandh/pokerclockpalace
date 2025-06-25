
import { supabase } from '@/lib/supabase'
import { TournamentState } from '@/types/tournament'
import { RealtimeChannel } from '@supabase/supabase-js'

export class TournamentJoiningService {
  static async joinTournament(tournamentId: string): Promise<{ tournament: TournamentState, channel?: RealtimeChannel }> {
    console.log('🔄 Joining tournament:', tournamentId);

    try {
      // Get tournament and its current state
      const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single()

      if (tournamentError) {
        console.error('❌ Error loading tournament:', tournamentError);
        throw tournamentError;
      }

      const { data: state, error: stateError } = await supabase
        .from('tournament_states')
        .select('*')
        .eq('tournament_id', tournamentId)
        .single()

      if (stateError) {
        console.error('❌ Error loading tournament state:', stateError);
        throw stateError;
      }

      console.log('✅ Tournament data loaded:', { tournament: tournament.name, state: state.is_running });

      // Convert to TournamentState format with proper type conversion
      const tournamentState: TournamentState = {
        id: tournament.id,
        structure: {
          id: tournament.id,
          name: tournament.name,
          buyIn: tournament.buy_in,
          reentryFee: tournament.reentry_fee,
          guaranteedPrizePool: tournament.guaranteed_prize_pool,
          initialStack: tournament.initial_stack,
          levels: tournament.levels as any, // Convert from JSON
          breakAfterLevels: tournament.break_after_levels,
          payoutStructure: tournament.payout_structure as any // Convert from JSON
        },
        currentLevelIndex: state.current_level_index,
        timeRemaining: state.time_remaining,
        isRunning: state.is_running,
        isPaused: state.is_paused,
        isOnBreak: state.is_on_break,
        players: state.players,
        entries: state.entries,
        reentries: state.reentries,
        currentPrizePool: state.current_prize_pool,
        startTime: state.start_time ? Date.parse(state.start_time) : undefined
      }

      console.log('✅ Tournament state parsed successfully');

      // Set up real-time subscription with optimized configuration
      const channel = supabase
        .channel(`tournament_${tournamentId}`, {
          config: {
            broadcast: { self: false },
            presence: { key: tournamentId }
          }
        });

      console.log('🔄 Setting up real-time channel for tournament:', tournamentId);

      return { tournament: tournamentState, channel }
    } catch (error) {
      console.error('❌ Error in joinTournament:', error);
      throw error;
    }
  }
}
