
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useServerTimer(tournamentId: string | null) {
  const [serverTimeRemaining, setServerTimeRemaining] = useState<number | null>(null);
  const [serverLevelIndex, setServerLevelIndex] = useState<number | null>(null);

  const fetchServerTime = useCallback(async () => {
    if (!tournamentId) return null;

    try {
      // Calculate time remaining using the new mathematical approach
      const { data: timeData, error: timeError } = await supabase.rpc(
        'calculate_time_remaining' as any,
        { p_tournament_id: tournamentId }
      );

      if (timeError) {
        console.error('Error fetching server time:', timeError);
        return null;
      }

      return timeData as number;
    } catch (error) {
      console.error('Error calculating server time:', error);
      return null;
    }
  }, [tournamentId]);

  const fetchServerLevelIndex = useCallback(async () => {
    if (!tournamentId) return null;

    try {
      // Calculate current level index using the new mathematical approach
      const { data: levelData, error: levelError } = await supabase.rpc(
        'calculate_current_level_index' as any,
        { p_tournament_id: tournamentId }
      );

      if (levelError) {
        console.error('Error fetching server level index:', levelError);
        return null;
      }

      return levelData as number;
    } catch (error) {
      console.error('Error calculating server level index:', error);
      return null;
    }
  }, [tournamentId]);

  const syncWithServer = useCallback(async () => {
    if (!tournamentId) return;

    console.log('🔄 Syncing with server using mathematical calculation...');
    
    const [serverTime, levelIndex] = await Promise.all([
      fetchServerTime(),
      fetchServerLevelIndex()
    ]);
    
    if (serverTime !== null) {
      setServerTimeRemaining(serverTime);
      console.log(`📊 Server time calculated: ${serverTime}s`);
    }
    
    if (levelIndex !== null) {
      setServerLevelIndex(levelIndex);
      console.log(`📊 Server level calculated: ${levelIndex}`);
    }
  }, [fetchServerTime, fetchServerLevelIndex, tournamentId]);

  useEffect(() => {
    if (tournamentId) {
      syncWithServer();
    }
  }, [tournamentId, syncWithServer]);

  return {
    serverTimeRemaining,
    serverLevelIndex,
    syncWithServer,
    fetchServerTime,
    fetchServerLevelIndex
  };
}
