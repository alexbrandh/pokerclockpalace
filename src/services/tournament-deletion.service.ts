
import { supabase } from '@/lib/supabase'

export class TournamentDeletionService {
  static async deleteTournament(tournamentId: string): Promise<void> {
    console.log('🗑️ Starting tournament deletion process for ID:', tournamentId);

    try {
      // Step 1: Verify tournament exists before deletion
      const { data: existingTournament, error: checkError } = await supabase
        .from('tournaments')
        .select('id, name')
        .eq('id', tournamentId)
        .single();

      if (checkError) {
        console.error('❌ Error checking tournament existence:', checkError);
        throw new Error(`Tournament not found: ${checkError.message}`);
      }

      if (!existingTournament) {
        console.error('❌ Tournament not found with ID:', tournamentId);
        throw new Error('Tournament not found');
      }

      console.log('✅ Tournament found:', existingTournament.name);

      // Step 2: Delete the tournament (CASCADE will handle related records)
      console.log('🔄 Deleting tournament and all related records...');
      const { error: tournamentError, count: tournamentCount } = await supabase
        .from('tournaments')
        .delete({ count: 'exact' })
        .eq('id', tournamentId);

      if (tournamentError) {
        console.error('❌ Error deleting tournament:', tournamentError);
        throw new Error(`Error deleting tournament: ${tournamentError.message}`);
      }

      if (tournamentCount === 0) {
        console.error('❌ No tournament was deleted - possible permissions issue');
        throw new Error('Tournament deletion failed - no records were deleted');
      }

      console.log(`✅ Successfully deleted ${tournamentCount} tournament record and all related data`);

      // Step 3: Verify deletion was successful
      console.log('🔄 Verifying deletion...');
      const { data: verifyTournament, error: verifyError } = await supabase
        .from('tournaments')
        .select('id')
        .eq('id', tournamentId)
        .maybeSingle();

      if (verifyError) {
        console.error('⚠️ Error verifying deletion:', verifyError);
      } else if (verifyTournament) {
        console.error('❌ Tournament still exists after deletion attempt!');
        throw new Error('Tournament deletion verification failed - record still exists');
      } else {
        console.log('✅ Deletion verified - tournament no longer exists in database');
      }

      console.log('🎉 Tournament deletion process completed successfully');

    } catch (error) {
      console.error('💥 Tournament deletion failed:', error);
      throw error;
    }
  }
}
