
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

  // Enhanced real-time connection with better error handling
  const handleStateUpdate = useCallback((payload: any) => {
    console.log('📡 Processing tournament update:', {
      event: payload.eventType,
      table: payload.table,
      timestamp: new Date().toISOString()
    });
    
    // Real-time updates are now handled by the SupabaseTournamentContext
    // This callback serves as additional logging and monitoring
  }, []);

  const { 
    connectionStatus, 
    reconnect, 
    isConnected, 
    errorMessage, 
    reconnectAttempts 
  } = useRealtimeConnection({
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
    errorMessage,
    reconnectAttempts,
    reconnect,
    error: error || errorMessage, // Combine context error with connection error
    lastMinuteAlert,
    actionHistory,
    breakTimeRemaining,
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
