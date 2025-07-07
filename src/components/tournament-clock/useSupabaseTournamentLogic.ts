
import { useCallback } from 'react';
import { useSupabaseTournament } from '@/contexts/SupabaseTournamentContext';
import { useTournamentActions } from '@/hooks/useTournamentActions';
import { useTournamentPlayerActions } from '@/hooks/useTournamentPlayerActions';
import { useTournamentHistory } from '@/hooks/useTournamentHistory';
import { useTournamentTimer } from '@/hooks/useTournamentTimer';

export function useSupabaseTournamentLogic() {
  const { 
    currentTournament, 
    error, 
    realtimeConnection 
  } = useSupabaseTournament();
  
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

  console.log('🎯 Tournament logic state:', {
    hasCurrentTournament: !!currentTournament,
    connectionStatus: realtimeConnection.status,
    isConnected: realtimeConnection.isConnected,
    error: error || realtimeConnection.error
  });

  return {
    tournament: currentTournament ? {
      ...currentTournament,
      timeRemaining: clientTimeRemaining, // Use client time for smooth UI
      currentLevelIndex: clientLevelIndex, // Use calculated level index
      isOnBreak: clientIsOnBreak // Use calculated break status
    } : null,
    isConnected: realtimeConnection.isConnected,
    connectionStatus: realtimeConnection.status,
    error: error || realtimeConnection.error,
    reconnect: realtimeConnection.reconnect,
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
