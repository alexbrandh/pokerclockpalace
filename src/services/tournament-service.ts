
import { supabase, getCurrentUserId, generateAccessCode, isSupabaseConfigured } from '@/lib/supabase'
import { TournamentState, TournamentStructure } from '@/types/tournament'
import { Tournament, TournamentStateDB } from '@/types/tournament-context'
import { RealtimeChannel } from '@supabase/supabase-js'

export class TournamentService {
  static async createTournament(structure: TournamentStructure, city: string): Promise<string> {
    const userId = await getCurrentUserId()
    const accessCode = generateAccessCode()

    // Create tournament with proper JSON conversion
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert({
        name: structure.name,
        buy_in: structure.buyIn,
        reentry_fee: structure.reentryFee,
        guaranteed_prize_pool: structure.guaranteedPrizePool,
        initial_stack: structure.initialStack,
        levels: structure.levels as any, // Convert to JSON
        break_after_levels: structure.breakAfterLevels,
        payout_structure: structure.payoutStructure as any, // Convert to JSON
        status: 'created',
        created_by: userId,
        city: city,
        access_code: accessCode
      })
      .select()
      .single()

    if (tournamentError) throw tournamentError

    // Create initial tournament state
    const { error: stateError } = await supabase
      .from('tournament_states')
      .insert({
        tournament_id: tournament.id,
        current_level_index: 0,
        time_remaining: structure.levels[0]?.duration * 60 || 1200,
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

    // Log creation with proper JSON conversion
    await supabase
      .from('tournament_logs')
      .insert({
        tournament_id: tournament.id,
        action: 'tournament_created',
        details: { structure, city } as any, // Convert to JSON
        created_by: userId
      })

    return tournament.id
  }

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

  static async joinTournament(tournamentId: string): Promise<{ tournament: TournamentState, channel?: RealtimeChannel }> {
    console.log('Joining tournament:', tournamentId);

    // Get tournament and its current state
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single()

    if (tournamentError) throw tournamentError

    const { data: state, error: stateError } = await supabase
      .from('tournament_states')
      .select('*')
      .eq('tournament_id', tournamentId)
      .single()

    if (stateError) throw stateError

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

    console.log('Tournament state loaded:', tournamentState);

    // Set up real-time subscription with better error handling
    const channel = supabase
      .channel(`tournament_${tournamentId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: tournamentId }
        }
      });

    console.log('Setting up real-time channel for tournament:', tournamentId);

    return { tournament: tournamentState, channel }
  }

  static async updateTournamentState(tournamentId: string, updates: Partial<TournamentState>): Promise<void> {
    console.log('TournamentService: Updating tournament state for:', tournamentId, updates);

    try {
      const userId = await getCurrentUserId();
      
      // Build the update object with only the fields that were provided
      const updateData: any = {
        updated_by: userId,
        updated_at: new Date().toISOString()
      };

      // Only add fields that were actually provided in the updates
      if (updates.currentLevelIndex !== undefined) updateData.current_level_index = updates.currentLevelIndex;
      if (updates.timeRemaining !== undefined) updateData.time_remaining = updates.timeRemaining;
      if (updates.isRunning !== undefined) updateData.is_running = updates.isRunning;
      if (updates.isPaused !== undefined) updateData.is_paused = updates.isPaused;
      if (updates.isOnBreak !== undefined) updateData.is_on_break = updates.isOnBreak;
      if (updates.players !== undefined) updateData.players = updates.players;
      if (updates.entries !== undefined) updateData.entries = updates.entries;
      if (updates.reentries !== undefined) updateData.reentries = updates.reentries;
      if (updates.currentPrizePool !== undefined) updateData.current_prize_pool = updates.currentPrizePool;
      if (updates.startTime !== undefined) updateData.start_time = updates.startTime ? new Date(updates.startTime).toISOString() : null;

      console.log('Database update payload:', updateData);

      const { data, error } = await supabase
        .from('tournament_states')
        .update(updateData)
        .eq('tournament_id', tournamentId)
        .select()
        .single();

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('✅ Database update successful:', data);

      // Log the action with proper JSON conversion
      await supabase
        .from('tournament_logs')
        .insert({
          tournament_id: tournamentId,
          action: 'state_updated',
          details: updates as any, // Convert to JSON
          created_by: userId
        });

    } catch (error) {
      console.error('❌ Error in updateTournamentState:', error);
      throw error;
    }
  }
}
