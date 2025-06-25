
import { supabase, getCurrentUserId, generateAccessCode, isSupabaseConfigured } from '@/lib/supabase'
import { TournamentState, TournamentStructure } from '@/types/tournament'
import { Tournament, TournamentStateDB } from '@/types/tournament-context'
import { mockTournaments } from '@/data/mock-tournaments'
import { RealtimeChannel } from '@supabase/supabase-js'

export class TournamentService {
  static async createTournament(structure: TournamentStructure, city: string): Promise<string> {
    if (!isSupabaseConfigured()) {
      // Demo mode - create mock tournament
      const demoTournament: Tournament = {
        id: 'demo-' + Date.now(),
        name: structure.name,
        buy_in: structure.buyIn,
        reentry_fee: structure.reentryFee,
        guaranteed_prize_pool: structure.guaranteedPrizePool,
        initial_stack: structure.initialStack,
        levels: structure.levels,
        break_after_levels: structure.breakAfterLevels,
        payout_structure: structure.payoutStructure,
        status: 'created',
        created_by: 'demo-user',
        created_at: new Date().toISOString(),
        city: city,
        access_code: generateAccessCode()
      };
      
      return demoTournament.id;
    }

    const userId = await getCurrentUserId()
    const accessCode = generateAccessCode()

    // Create tournament
    const { data: tournament, error: tournamentError } = await supabase!
      .from('tournaments')
      .insert({
        name: structure.name,
        buy_in: structure.buyIn,
        reentry_fee: structure.reentryFee,
        guaranteed_prize_pool: structure.guaranteedPrizePool,
        initial_stack: structure.initialStack,
        levels: structure.levels,
        break_after_levels: structure.breakAfterLevels,
        payout_structure: structure.payoutStructure,
        status: 'created',
        created_by: userId,
        city: city,
        access_code: accessCode
      })
      .select()
      .single()

    if (tournamentError) throw tournamentError

    // Create initial tournament state
    const { error: stateError } = await supabase!
      .from('tournament_states')
      .insert({
        tournament_id: tournament.id,
        current_level_index: 0,
        time_remaining: structure.levels[0]?.duration * 60 || 0,
        is_running: false,
        is_paused: false,
        is_on_break: false,
        players: 0,
        entries: 0,
        reentries: 0,
        current_prize_pool: structure.guaranteedPrizePool,
        updated_by: userId
      })

    if (stateError) throw stateError

    // Log creation
    await supabase!
      .from('tournament_logs')
      .insert({
        tournament_id: tournament.id,
        action: 'tournament_created',
        details: { structure, city },
        created_by: userId
      })

    return tournament.id
  }

  static async loadTournaments(): Promise<Tournament[]> {
    if (!isSupabaseConfigured()) {
      return mockTournaments;
    }

    const { data, error } = await supabase!
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async joinTournament(tournamentId: string): Promise<{ tournament: TournamentState, channel?: RealtimeChannel }> {
    console.log('Joining tournament:', tournamentId);

    if (!isSupabaseConfigured()) {
      // Demo mode - find tournament in mock data
      const tournament = mockTournaments.find(t => t.id === tournamentId);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      const tournamentState: TournamentState = {
        id: tournament.id,
        structure: {
          id: tournament.id,
          name: tournament.name,
          buyIn: tournament.buy_in,
          reentryFee: tournament.reentry_fee,
          guaranteedPrizePool: tournament.guaranteed_prize_pool,
          initialStack: tournament.initial_stack,
          levels: tournament.levels,
          breakAfterLevels: tournament.break_after_levels,
          payoutStructure: tournament.payout_structure
        },
        currentLevelIndex: 0,
        timeRemaining: tournament.levels[0]?.duration * 60 || 1200,
        isRunning: false,
        isPaused: false,
        isOnBreak: false,
        players: 0,
        entries: 0,
        reentries: 0,
        currentPrizePool: tournament.guaranteed_prize_pool,
        startTime: undefined
      };

      return { tournament: tournamentState };
    }

    // Get tournament and its current state
    const { data: tournament, error: tournamentError } = await supabase!
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single()

    if (tournamentError) throw tournamentError

    const { data: state, error: stateError } = await supabase!
      .from('tournament_states')
      .select('*')
      .eq('tournament_id', tournamentId)
      .single()

    if (stateError) throw stateError

    // Convert to TournamentState format
    const tournamentState: TournamentState = {
      id: tournament.id,
      structure: {
        id: tournament.id,
        name: tournament.name,
        buyIn: tournament.buy_in,
        reentryFee: tournament.reentry_fee,
        guaranteedPrizePool: tournament.guaranteed_prize_pool,
        initialStack: tournament.initial_stack,
        levels: tournament.levels,
        breakAfterLevels: tournament.break_after_levels,
        payoutStructure: tournament.payout_structure
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

    // Set up real-time subscription
    const channel = supabase!
      .channel(`tournament_${tournamentId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tournament_states', filter: `tournament_id=eq.${tournamentId}` },
        (payload) => {
          console.log('Real-time update:', payload)
        }
      )
      .subscribe()

    return { tournament: tournamentState, channel }
  }

  static async updateTournamentState(tournamentId: string, updates: Partial<TournamentState>): Promise<void> {
    console.log('Updating tournament state:', updates);

    if (!isSupabaseConfigured()) {
      // Demo mode - no actual update needed
      return;
    }

    const userId = await getCurrentUserId()
    
    const { error } = await supabase!
      .from('tournament_states')
      .update({
        current_level_index: updates.currentLevelIndex,
        time_remaining: updates.timeRemaining,
        is_running: updates.isRunning,
        is_paused: updates.isPaused,
        is_on_break: updates.isOnBreak,
        players: updates.players,
        entries: updates.entries,
        reentries: updates.reentries,
        current_prize_pool: updates.currentPrizePool,
        start_time: updates.startTime ? new Date(updates.startTime).toISOString() : undefined,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('tournament_id', tournamentId)

    if (error) throw error

    // Log the action
    await supabase!
      .from('tournament_logs')
      .insert({
        tournament_id: tournamentId,
        action: 'state_updated',
        details: updates,
        created_by: userId
      })
  }
}
