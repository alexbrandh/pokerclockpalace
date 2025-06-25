
import { useState, useEffect, useCallback } from 'react';
import { useSupabaseTournament } from '@/contexts/SupabaseTournamentContext';
import { useSoundSystem } from '@/hooks/useSoundSystem';
import { useServerTimer } from '@/hooks/useServerTimer';
import { useRealtimeConnection } from '@/hooks/useRealtimeConnection';

export function useSupabaseTournamentLogic() {
  const { currentTournament, updateTournamentState, error } = useSupabaseTournament();
  const { playSound } = useSoundSystem();
  const { 
    serverTimeRemaining, 
    serverLevelIndex, 
    syncWithServer 
  } = useServerTimer(currentTournament?.id || null);
  
  const [lastMinuteAlert, setLastMinuteAlert] = useState(false);
  const [actionHistory, setActionHistory] = useState<Array<Partial<any>>>([]);
  const [clientTimeRemaining, setClientTimeRemaining] = useState<number>(0);
  const [clientLevelIndex, setClientLevelIndex] = useState<number>(0);

  // Helper function to save state for undo
  const saveStateForUndo = useCallback(() => {
    if (currentTournament) {
      setActionHistory(prev => [...prev.slice(-9), { ...currentTournament }]);
    }
  }, [currentTournament]);

  // Real-time connection - now only for manual changes, not automatic time sync
  const handleStateUpdate = useCallback((payload: any) => {
    console.log('📡 Processing manual tournament update:', payload);
    // Only sync when there are manual changes (pause, player changes, etc.)
    // Time calculation is now done mathematically
    syncWithServer();
  }, [syncWithServer]);

  const { connectionStatus, reconnect, isConnected } = useRealtimeConnection({
    tournamentId: currentTournament?.id || '',
    onStateUpdate: handleStateUpdate
  });

  // Sync client time and level with server calculations
  useEffect(() => {
    if (serverTimeRemaining !== null) {
      setClientTimeRemaining(serverTimeRemaining);
    } else if (currentTournament) {
      setClientTimeRemaining(currentTournament.timeRemaining);
    }

    if (serverLevelIndex !== null) {
      setClientLevelIndex(serverLevelIndex);
    } else if (currentTournament) {
      setClientLevelIndex(currentTournament.currentLevelIndex);
    }
  }, [serverTimeRemaining, serverLevelIndex, currentTournament?.timeRemaining, currentTournament?.currentLevelIndex]);

  // Client-side timer for smooth UI updates - now syncs with mathematical calculation
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
        
        // Level completion - let the mathematical calculation handle this
        if (newTime === 0) {
          console.log('⏰ Level completed, syncing with server calculation...');
          syncWithServer();
          setLastMinuteAlert(false);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTournament, syncWithServer, lastMinuteAlert, playSound]);

  // Periodic server sync (less frequent now since it's more reliable)
  useEffect(() => {
    if (!currentTournament?.isRunning || currentTournament?.isPaused) return;

    const syncInterval = setInterval(() => {
      console.log('🔄 Periodic mathematical sync');
      syncWithServer();
    }, 60000); // Sync every minute instead of every 30 seconds

    return () => clearInterval(syncInterval);
  }, [currentTournament?.isRunning, currentTournament?.isPaused, syncWithServer]);

  const toggleTimer = useCallback(() => {
    if (!currentTournament) return;
    
    saveStateForUndo();
    playSound('buttonClick');
    
    if (currentTournament.isPaused) {
      // When resuming, set start_time if it doesn't exist
      const updates: any = {
        isRunning: true,
        isPaused: false
      };
      
      // Set start_time when starting tournament for the first time
      if (!currentTournament.startTime) {
        updates.startTime = Date.now();
      }
      
      updateTournamentState(updates);
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
      timeRemaining: clientTimeRemaining, // Use client time for smooth UI
      currentLevelIndex: clientLevelIndex // Use calculated level index
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
