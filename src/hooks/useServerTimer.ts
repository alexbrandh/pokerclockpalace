
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface ServerTimeResult {
  time_remaining_seconds: number;
  is_on_break: boolean;
  break_time_remaining: number;
}

interface ServerLevelResult {
  current_level_index: number;
  is_on_break: boolean;
}

export function useServerTimer(tournamentId: string | null) {
  const [serverTimeRemaining, setServerTimeRemaining] = useState<number | null>(null);
  const [serverLevelIndex, setServerLevelIndex] = useState<number | null>(null);
  const [serverIsOnBreak, setServerIsOnBreak] = useState<boolean | null>(null);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState<number | null>(null);

  const fetchServerTime = useCallback(async () => {
    if (!tournamentId) return null;

    try {
      // Calculate time remaining using the new mathematical approach with break support
      const { data: timeData, error: timeError } = await supabase.rpc(
        'calculate_time_remaining' as any,
        { p_tournament_id: tournamentId }
      );

      if (timeError) {
        console.error('Error fetching server time:', timeError);
        return null;
      }

      return timeData as ServerTimeResult[];
    } catch (error) {
      console.error('Error calculating server time:', error);
      return null;
    }
  }, [tournamentId]);

  const fetchServerLevelIndex = useCallback(async () => {
    if (!tournamentId) return null;

    try {
      // Calculate current level index using the new mathematical approach with break support
      const { data: levelData, error: levelError } = await supabase.rpc(
        'calculate_current_level_index' as any,
        { p_tournament_id: tournamentId }
      );

      if (levelError) {
        console.error('Error fetching server level index:', levelError);
        return null;
      }

      return levelData as ServerLevelResult[];
    } catch (error) {
      console.error('Error calculating server level index:', error);
      return null;
    }
  }, [tournamentId]);

  const syncWithServer = useCallback(async () => {
    if (!tournamentId) return;

    console.log('🔄 Syncing with server using mathematical calculation with break support...');
    
    const [serverTime, levelIndex] = await Promise.all([
      fetchServerTime(),
      fetchServerLevelIndex()
    ]);
    
    if (serverTime && serverTime.length > 0) {
      const timeResult = serverTime[0];
      setServerTimeRemaining(timeResult.time_remaining_seconds);
      setServerIsOnBreak(timeResult.is_on_break);
      setBreakTimeRemaining(timeResult.break_time_remaining);
      console.log(`📊 Server time calculated: ${timeResult.time_remaining_seconds}s, break: ${timeResult.is_on_break}, break_time: ${timeResult.break_time_remaining}s`);
    }
    
    if (levelIndex && levelIndex.length > 0) {
      const levelResult = levelIndex[0];
      setServerLevelIndex(levelResult.current_level_index);
      // Note: We prioritize break status from time calculation as it's more detailed
      console.log(`📊 Server level calculated: ${levelResult.current_level_index}, break: ${levelResult.is_on_break}`);
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
    serverIsOnBreak,
    breakTimeRemaining,
    syncWithServer,
    fetchServerTime,
    fetchServerLevelIndex
  };
}
