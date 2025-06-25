
import { useState, useEffect, useCallback } from 'react';
import { useSupabaseTournament } from '@/contexts/SupabaseTournamentContext';
import { useSoundSystem } from '@/hooks/useSoundSystem';
import { useServerTimer } from '@/hooks/useServerTimer';
import { useRealtimeConnection } from '@/hooks/useRealtimeConnection';

export function useSupabaseTournamentLogic() {
  const { currentTournament, updateTournamentState, error } = useSupabaseTournament();
  const { playSound } = useSoundSystem();
  const { serverTimeRemaining, syncWithServer } = useServerTimer(currentTournament?.id || null);
  
  const [lastMinuteAlert, setLastMinuteAlert] = useState(false);
  const [actionHistory, setActionHistory] = useState<Array<Partial<any>>>([]);
  const [clientTimeRemaining, setClientTimeRemaining] = useState<number>(0);

  // Helper function to save state for undo
  const saveStateForUndo = useCallback(() => {
    if (currentTournament) {
      setActionHistory(prev => [...prev.slice(-9), { ...currentTournament }]);
    }
  }, [currentTournament]);

  // Real-time connection with auto-reconnection
  const handleStateUpdate = useCallback((payload: any) => {
    console.log('📡 Processing real-time update:', payload);
    syncWithServer(); // Sync with server time when state changes
  }, [syncWithServer]);

  const { connectionStatus, reconnect, isConnected } = useRealtimeConnection({
    tournamentId: currentTournament?.id || '',
    onStateUpdate: handleStateUpdate
  });

  // Sync client time with server time
  useEffect(() => {
    if (serverTimeRemaining !== null) {
      setClientTimeRemaining(serverTimeRemaining);
    } else if (currentTournament) {
      setClientTimeRemaining(currentTournament.timeRemaining);
    }
  }, [serverTimeRemaining, currentTournament?.timeRemaining]);

  // Client-side timer for smooth UI updates (syncs with server)
  useEffect(() => {
    if (!currentTournament || !currentTournament.isRunning || currentTournament.isPaused) return;

    const interval = setInterval(() => {
      setClientTimeRemaining(prev => {
        const newTime = Math.max(0, prev - 1);
        
        // Last minute alert
        if (newTime === 60 && !lastMinuteAlert && !currentTournament.isOnBreak) {
          setLastMinuteAlert(true);
          playSound('lastMinute');
        } else if (newTime > 60) {
          setLastMinuteAlert(false);
        }
        
        // Level completion
        if (newTime === 0) {
          const nextLevelIndex = currentTournament.currentLevelIndex + 1;
          const nextLevelData = currentTournament.structure.levels[nextLevelIndex];
          
          if (nextLevelData) {
            const shouldAutoPause = nextLevelData.isBreak;
            
            updateTournamentState({
              currentLevelIndex: nextLevelIndex,
              timeRemaining: nextLevelData.duration * 60,
              isOnBreak: nextLevelData.isBreak,
              isPaused: shouldAutoPause
            });
            
            if (nextLevelData.isBreak) {
              playSound('breakStart');
            } else {
              playSound('levelChange');
            }
          } else {
            updateTournamentState({
              isRunning: false,
              isPaused: true
            });
          }
          setLastMinuteAlert(false);
          return newTime;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTournament, updateTournamentState, lastMinuteAlert, playSound]);

  // Periodic server sync (every 30 seconds)
  useEffect(() => {
    if (!currentTournament?.isRunning || currentTournament?.isPaused) return;

    const syncInterval = setInterval(() => {
      console.log('🔄 Periodic server sync');
      syncWithServer();
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [currentTournament?.isRunning, currentTournament?.isPaused, syncWithServer]);

  const toggleTimer = useCallback(() => {
    if (!currentTournament) return;
    
    saveStateForUndo();
    playSound('buttonClick');
    
    if (currentTournament.isPaused) {
      updateTournamentState({
        isRunning: true,
        isPaused: false
      });
    } else {
      updateTournamentState({
        isPaused: true
      });
    }
  }, [currentTournament, saveStateForUndo, playSound, updateTournamentState]);

  const nextLevel = useCallback(() => {
    if (!currentTournament) return;
    
    saveStateForUndo();
    playSound('buttonClick');
    
    const nextLevelIndex = currentTournament.currentLevelIndex + 1;
    const nextLevelData = currentTournament.structure.levels[nextLevelIndex];
    
    if (nextLevelData) {
      updateTournamentState({
        currentLevelIndex: nextLevelIndex,
        timeRemaining: nextLevelData.duration * 60,
        isOnBreak: nextLevelData.isBreak,
        isPaused: nextLevelData.isBreak
      });

      if (nextLevelData.isBreak) {
        playSound('breakStart');
      } else {
        playSound('levelChange');
      }
    }
  }, [currentTournament, saveStateForUndo, playSound, updateTournamentState]);

  const skipBreak = useCallback(() => {
    if (!currentTournament || !currentTournament.isOnBreak) return;
    
    saveStateForUndo();
    playSound('buttonClick');
    
    const nextLevelIndex = currentTournament.currentLevelIndex + 1;
    const nextLevelData = currentTournament.structure.levels[nextLevelIndex];
    
    if (nextLevelData && !nextLevelData.isBreak) {
      updateTournamentState({
        currentLevelIndex: nextLevelIndex,
        timeRemaining: nextLevelData.duration * 60,
        isOnBreak: false,
        isPaused: false
      });
      playSound('levelChange');
    }
  }, [currentTournament, saveStateForUndo, playSound, updateTournamentState]);

  const resetLevel = useCallback(() => {
    if (!currentTournament) return;
    
    saveStateForUndo();
    playSound('buttonClick');
    
    const currentLevel = currentTournament.structure.levels[currentTournament.currentLevelIndex];
    updateTournamentState({
      timeRemaining: currentLevel.duration * 60
    });
  }, [currentTournament, saveStateForUndo, playSound, updateTournamentState]);

  const addPlayer = useCallback(() => {
    if (!currentTournament) return;
    
    saveStateForUndo();
    playSound('buttonClick');
    
    updateTournamentState({
      players: currentTournament.players + 1,
      entries: currentTournament.entries + 1,
      currentPrizePool: currentTournament.currentPrizePool + currentTournament.structure.buyIn
    });
  }, [currentTournament, saveStateForUndo, playSound, updateTournamentState]);

  const eliminatePlayer = useCallback(() => {
    if (!currentTournament || currentTournament.players <= 0) return;
    
    saveStateForUndo();
    playSound('buttonClick');
    
    updateTournamentState({
      players: currentTournament.players - 1
    });
  }, [currentTournament, saveStateForUndo, playSound, updateTournamentState]);

  const addReentry = useCallback(() => {
    if (!currentTournament) return;
    
    saveStateForUndo();
    playSound('buttonClick');
    
    updateTournamentState({
      players: currentTournament.players + 1,
      reentries: currentTournament.reentries + 1,
      currentPrizePool: currentTournament.currentPrizePool + currentTournament.structure.reentryFee
    });
  }, [currentTournament, saveStateForUndo, playSound, updateTournamentState]);

  const undoLastAction = useCallback(() => {
    if (actionHistory.length === 0) return;
    
    const lastState = actionHistory[actionHistory.length - 1];
    setActionHistory(prev => prev.slice(0, -1));
    
    if (lastState && currentTournament) {
      updateTournamentState(lastState);
    }
  }, [actionHistory, updateTournamentState, currentTournament]);

  return {
    tournament: currentTournament ? {
      ...currentTournament,
      timeRemaining: clientTimeRemaining // Use client time for smooth UI
    } : null,
    isConnected,
    connectionStatus,
    reconnect,
    error,
    lastMinuteAlert,
    actionHistory,
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
