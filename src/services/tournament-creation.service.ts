
import { supabase, getCurrentUserId, generateAccessCode } from '@/lib/supabase'
import { TournamentStructure } from '@/types/tournament'

export class TournamentCreationService {
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
}
