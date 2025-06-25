
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useServerTimer(tournamentId: string | null) {
  const [serverTimeRemaining, setServerTimeRemaining] = useState<number | null>(null);

  const fetchServerTime = useCallback(async () => {
    if (!tournamentId) return null;

    try {
      const { data, error } = await supabase.rpc('calculate_time_remaining' as any, {
        p_tournament_id: tournamentId
      });

      if (error) {
        console.error('Error fetching server time:', error);
        return null;
      }

      return data as number;
    } catch (error) {
      console.error('Error calculating server time:', error);
      return null;
    }
  }, [tournamentId]);

  const syncWithServer = useCallback(async () => {
    const serverTime = await fetchServerTime();
    if (serverTime !== null) {
      setServerTimeRemaining(serverTime);
    }
  }, [fetchServerTime]);

  useEffect(() => {
    if (tournamentId) {
      syncWithServer();
    }
  }, [tournamentId, syncWithServer]);

  return {
    serverTimeRemaining,
    syncWithServer,
    fetchServerTime
  };
}
