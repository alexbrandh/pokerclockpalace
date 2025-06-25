
import { useCallback } from 'react';
import { useSupabaseTournament } from '@/contexts/SupabaseTournamentContext';
import { useSoundSystem } from '@/hooks/useSoundSystem';

export function useTournamentActions() {
  const { currentTournament, updateTournamentState } = useSupabaseTournament();
  const { playSound } = useSoundSystem();

  const toggleTimer = useCallback(() => {
    if (!currentTournament) return;
    
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
  }, [currentTournament, playSound, updateTournamentState]);

  const nextLevel = useCallback(() => {
    if (!currentTournament) return;
    
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
  }, [currentTournament, playSound, updateTournamentState]);

  const skipBreak = useCallback(() => {
    if (!currentTournament || !currentTournament.isOnBreak) return;
    
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
  }, [currentTournament, playSound, updateTournamentState]);

  const resetLevel = useCallback(() => {
    if (!currentTournament) return;
    
    playSound('buttonClick');
    
    const currentLevel = currentTournament.structure.levels[currentTournament.currentLevelIndex];
    updateTournamentState({
      timeRemaining: currentLevel.duration * 60
    });
  }, [currentTournament, playSound, updateTournamentState]);

  return {
    toggleTimer,
    nextLevel,
    skipBreak,
    resetLevel
  };
}
