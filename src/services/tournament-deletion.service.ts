
import { supabase } from '@/lib/supabase'

export class TournamentDeletionService {
  static async deleteTournament(tournamentId: string): Promise<void> {
    console.log('🗑️ Deleting tournament:', tournamentId);

    // Delete tournament state first (child record)
    const { error: stateError } = await supabase
      .from('tournament_states')
      .delete()
      .eq('tournament_id', tournamentId);

    if (stateError) {
      console.error('Error deleting tournament state:', stateError);
      throw new Error(`Error deleting tournament state: ${stateError.message}`);
    }

    // Delete tournament logs
    const { error: logsError } = await supabase
      .from('tournament_logs')
      .delete()
      .eq('tournament_id', tournamentId);

    if (logsError) {
      console.error('Error deleting tournament logs:', logsError);
      // Don't throw error for logs, it's not critical
    }

    // Delete the tournament itself
    const { error: tournamentError } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', tournamentId);

    if (tournamentError) {
      console.error('Error deleting tournament:', tournamentError);
      throw new Error(`Error deleting tournament: ${tournamentError.message}`);
    }

    console.log('✅ Tournament deleted successfully');
  }
}
