
import { useState, useEffect, useCallback } from 'react';
import { useTournament } from '@/contexts/TournamentContext';
import { useSoundSystem } from '@/hooks/useSoundSystem';

export function useTournamentLogic() {
  const { tournament, updateTournament, isConnected, error } = useTournament();
  const { playSound } = useSoundSystem();
  
  const [lastMinuteAlert, setLastMinuteAlert] = useState(false);
  const [actionHistory, setActionHistory] = useState<Array<Partial<any>>>([]);

  // Helper function to save state for undo
  const saveStateForUndo = useCallback(() => {
    if (tournament) {
      setActionHistory(prev => [...prev.slice(-9), { ...tournament }]); // Keep last 10 actions
    }
  }, [tournament]);

  // Main timer effect
  useEffect(() => {
    if (!tournament || !tournament.isRunning || tournament.isPaused) return;

    const interval = setInterval(() => {
      const newTime = tournament.timeRemaining - 1;
      
      if (newTime <= 0) {
        // Level completed, advance to next
        const nextLevelIndex = tournament.currentLevelIndex + 1;
        const nextLevelData = tournament.structure.levels[nextLevelIndex];
        
        if (nextLevelData) {
          // Auto-pause if entering a break
          const shouldAutoPause = nextLevelData.isBreak;
          
          updateTournament({
            currentLevelIndex: nextLevelIndex,
            timeRemaining: nextLevelData.duration * 60,
            isOnBreak: nextLevelData.isBreak,
            isPaused: shouldAutoPause // Auto-pause on breaks
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
          updateTournament({
            isRunning: false,
            isPaused: true
          });
        }
        setLastMinuteAlert(false);
      } else {
        updateTournament({ timeRemaining: newTime });
        
        // Last minute alert (only for non-break levels)
        if (newTime === 60 && !lastMinuteAlert && !tournament.isOnBreak) {
          setLastMinuteAlert(true);
          playSound('lastMinute');
        } else if (newTime > 60) {
          setLastMinuteAlert(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tournament, updateTournament, lastMinuteAlert, playSound]);

  const toggleTimer = useCallback(() => {
    if (!tournament) return;
    
    saveStateForUndo();
    playSound('buttonClick');
    
    if (tournament.isPaused) {
      updateTournament({
        isRunning: true,
        isPaused: false
      });
    } else {
      updateTournament({
        isPaused: true
      });
    }
  }, [tournament, saveStateForUndo, playSound, updateTournament]);

  const nextLevel = useCallback(() => {
    if (!tournament) return;
    
    saveStateForUndo();
    playSound('buttonClick');
    
    const nextLevelIndex = tournament.currentLevelIndex + 1;
    const nextLevelData = tournament.structure.levels[nextLevelIndex];
    
    if (nextLevelData) {
      updateTournament({
        currentLevelIndex: nextLevelIndex,
        timeRemaining: nextLevelData.duration * 60,
        isOnBreak: nextLevelData.isBreak,
        isPaused: nextLevelData.isBreak // Auto-pause if it's a break
      });

      // Play appropriate sound
      if (nextLevelData.isBreak) {
        playSound('breakStart');
      } else {
        playSound('levelChange');
      }
    }
  }, [tournament, saveStateForUndo, playSound, updateTournament]);

  const skipBreak = useCallback(() => {
    if (!tournament || !tournament.isOnBreak) return;
    
    saveStateForUndo();
    playSound('buttonClick');
    
    // Skip to the next non-break level
    const nextLevelIndex = tournament.currentLevelIndex + 1;
    const nextLevelData = tournament.structure.levels[nextLevelIndex];
    
    if (nextLevelData && !nextLevelData.isBreak) {
      updateTournament({
        currentLevelIndex: nextLevelIndex,
        timeRemaining: nextLevelData.duration * 60,
        isOnBreak: false,
        isPaused: false
      });
      playSound('levelChange');
    }
  }, [tournament, saveStateForUndo, playSound, updateTournament]);

  const resetLevel = useCallback(() => {
    if (!tournament) return;
    
    saveStateForUndo();
    playSound('buttonClick');
    
    const currentLevel = tournament.structure.levels[tournament.currentLevelIndex];
    updateTournament({
      timeRemaining: currentLevel.duration * 60
    });
  }, [tournament, saveStateForUndo, playSound, updateTournament]);

  const addPlayer = useCallback(() => {
    if (!tournament) return;
    
    saveStateForUndo();
    playSound('buttonClick');
    
    updateTournament({
      players: tournament.players + 1,
      entries: tournament.entries + 1,
      currentPrizePool: tournament.currentPrizePool + tournament.structure.buyIn
    });
  }, [tournament, saveStateForUndo, playSound, updateTournament]);

  const eliminatePlayer = useCallback(() => {
    if (!tournament || tournament.players <= 0) return;
    
    saveStateForUndo();
    playSound('buttonClick');
    
    updateTournament({
      players: tournament.players - 1
    });
  }, [tournament, saveStateForUndo, playSound, updateTournament]);

  const addReentry = useCallback(() => {
    if (!tournament) return;
    
    saveStateForUndo();
    playSound('buttonClick');
    
    updateTournament({
      players: tournament.players + 1,
      reentries: tournament.reentries + 1,
      currentPrizePool: tournament.currentPrizePool + tournament.structure.reentryFee
    });
  }, [tournament, saveStateForUndo, playSound, updateTournament]);

  const undoLastAction = useCallback(() => {
    if (actionHistory.length === 0) return;
    
    const lastState = actionHistory[actionHistory.length - 1];
    setActionHistory(prev => prev.slice(0, -1));
    
    if (lastState) {
      updateTournament(lastState);
    }
  }, [actionHistory, updateTournament]);

  return {
    tournament,
    isConnected,
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
