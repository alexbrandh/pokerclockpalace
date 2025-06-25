
import { supabase, getCurrentUserId } from '@/lib/supabase'
import { TournamentState } from '@/types/tournament'

export class TournamentStateUpdateService {
  static async updateTournamentState(tournamentId: string, updates: Partial<TournamentState>): Promise<void> {
    console.log('🔄 TournamentStateUpdateService: Updating tournament state for:', tournamentId, updates);

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

      console.log('📤 Database update payload:', updateData);

      const { data, error } = await supabase
        .from('tournament_states')
        .update(updateData)
        .eq('tournament_id', tournamentId)
        .select()
        .single();

      if (error) {
        console.error('❌ Database update error:', error);
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

      console.log('✅ Tournament log created successfully');

    } catch (error) {
      console.error('❌ Error in updateTournamentState:', error);
      throw error;
    }
  }
}
