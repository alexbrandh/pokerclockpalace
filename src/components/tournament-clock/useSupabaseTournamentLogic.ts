
import { useCallback } from 'react';
import { useSupabaseTournament } from '@/contexts/SupabaseTournamentContext';
import { useRealtimeConnection } from '@/hooks/useRealtimeConnection';
import { useTournamentActions } from '@/hooks/useTournamentActions';
import { useTournamentPlayerActions } from '@/hooks/useTournamentPlayerActions';
import { useTournamentHistory } from '@/hooks/useTournamentHistory';
import { useTournamentTimer } from '@/hooks/useTournamentTimer';

export function useSupabaseTournamentLogic() {
  const { currentTournament, error } = useSupabaseTournament();
  const { 
    clientTimeRemaining, 
    clientLevelIndex, 
    clientIsOnBreak, 
    lastMinuteAlert,
    breakTimeRemaining 
  } = useTournamentTimer();
  const { actionHistory, undoLastAction } = useTournamentHistory();
  const { toggleTimer, nextLevel, skipBreak, resetLevel } = useTournamentActions();
  const { addPlayer, eliminatePlayer, addReentry } = useTournamentPlayerActions();

  // Real-time connection - now only for manual changes, not automatic time sync
  const handleStateUpdate = useCallback((payload: any) => {
    console.log('📡 Processing manual tournament update:', payload);
    // Only sync when there are manual changes (pause, player changes, etc.)
    // Time calculation is now done mathematically
  }, []);

  const { connectionStatus, reconnect, isConnected } = useRealtimeConnection({
    tournamentId: currentTournament?.id || '',
    onStateUpdate: handleStateUpdate
  });

  return {
    tournament: currentTournament ? {
      ...currentTournament,
      timeRemaining: clientTimeRemaining, // Use client time for smooth UI
      currentLevelIndex: clientLevelIndex, // Use calculated level index
      isOnBreak: clientIsOnBreak // Use calculated break status
    } : null,
    isConnected,
    connectionStatus,
    reconnect,
    error,
    lastMinuteAlert,
    actionHistory,
    breakTimeRemaining, // New: expose break time remaining
    toggleTimer,
    nextLevel,
    skipBreak,
    resetLevel,
    addPlayer,
    eliminatePlayer,
    addReentry,
    undoLastAction
  };
}
