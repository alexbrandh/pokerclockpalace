
import { useState, useEffect, useCallback } from 'react';
import { useSupabaseTournament } from '@/contexts/SupabaseTournamentContext';
import { useSoundSystem } from '@/hooks/useSoundSystem';

export function useSupabaseTournamentLogic() {
  const { currentTournament, updateTournamentState, error } = useSupabaseTournament();
  const { playSound } = useSoundSystem();
  
  const [lastMinuteAlert, setLastMinuteAlert] = useState(false);
  const [actionHistory, setActionHistory] = useState<Array<Partial<any>>>([]);

  // Helper function to save state for undo
  const saveStateForUndo = useCallback(() => {
    if (currentTournament) {
      setActionHistory(prev => [...prev.slice(-9), { ...currentTournament }]);
    }
  }, [currentTournament]);

  // Main timer effect
  useEffect(() => {
    if (!currentTournament || !currentTournament.isRunning || currentTournament.isPaused) return;

    const interval = setInterval(() => {
      const newTime = currentTournament.timeRemaining - 1;
      
      if (newTime <= 0) {
        // Level completed, advance to next
        const nextLevelIndex = currentTournament.currentLevelIndex + 1;
        const nextLevelData = currentTournament.structure.levels[nextLevelIndex];
        
        if (nextLevelData) {
          // Auto-pause if entering a break
          const shouldAutoPause = nextLevelData.isBreak;
          
          updateTournamentState({
            currentLevelIndex: nextLevelIndex,
            timeRemaining: nextLevelData.duration * 60,
            isOnBreak: nextLevelData.isBreak,
            isPaused: shouldAutoPause
          });
          
          // Play appropriate sound
          if (nextLevelData.isBreak) {
            playSound('breakStart');
            console.log('🎵 Break time! Taking a pause...');
          } else {
            playSound('levelChange');
          }
        } else {
          // Tournament ended
          updateTournamentState({
            isRunning: false,
            isPaused: true
          });
        }
        setLastMinuteAlert(false);
      } else {
        updateTournamentState({ timeRemaining: newTime });
        
        // Last minute alert (only for non-break levels)
        if (newTime === 60 && !lastMinuteAlert && !currentTournament.isOnBreak) {
          setLastMinuteAlert(true);
          playSound('lastMinute');
        } else if (newTime > 60) {
          setLastMinuteAlert(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTournament, updateTournamentState, lastMinuteAlert, playSound]);

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

      // Play appropriate sound
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
    
    // Skip to the next non-break level
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
    tournament: currentTournament,
    isConnected: true, // Always connected to Supabase
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
