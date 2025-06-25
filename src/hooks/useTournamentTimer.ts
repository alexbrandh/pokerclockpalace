
import { useState, useEffect, useCallback } from 'react';
import { useSupabaseTournament } from '@/contexts/SupabaseTournamentContext';
import { useSoundSystem } from '@/hooks/useSoundSystem';
import { useServerTimer } from '@/hooks/useServerTimer';

export function useTournamentTimer() {
  const { currentTournament } = useSupabaseTournament();
  const { playSound } = useSoundSystem();
  const { 
    serverTimeRemaining, 
    serverLevelIndex, 
    serverIsOnBreak,
    breakTimeRemaining,
    syncWithServer 
  } = useServerTimer(currentTournament?.id || null);
  
  const [lastMinuteAlert, setLastMinuteAlert] = useState(false);
  const [clientTimeRemaining, setClientTimeRemaining] = useState<number>(0);
  const [clientLevelIndex, setClientLevelIndex] = useState<number>(0);
  const [clientIsOnBreak, setClientIsOnBreak] = useState<boolean>(false);

  // Sync client time and level with server calculations (now includes break support)
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

    if (serverIsOnBreak !== null) {
      setClientIsOnBreak(serverIsOnBreak);
    } else if (currentTournament) {
      setClientIsOnBreak(currentTournament.isOnBreak);
    }
  }, [
    serverTimeRemaining, 
    serverLevelIndex, 
    serverIsOnBreak,
    currentTournament?.timeRemaining, 
    currentTournament?.currentLevelIndex,
    currentTournament?.isOnBreak
  ]);

  // Client-side timer for smooth UI updates - now syncs with mathematical calculation
  useEffect(() => {
    if (!currentTournament || !currentTournament.isRunning || currentTournament.isPaused) return;

    const interval = setInterval(() => {
      setClientTimeRemaining(prev => {
        const newTime = Math.max(0, prev - 1);
        
        // Last minute alert (only for regular levels, not breaks)
        if (newTime === 60 && !lastMinuteAlert && !clientIsOnBreak) {
          setLastMinuteAlert(true);
          playSound('lastMinute');
        } else if (newTime > 60) {
          setLastMinuteAlert(false);
        }
        
        // Level/Break completion - let the mathematical calculation handle this
        if (newTime === 0) {
          console.log('⏰ Level/Break completed, syncing with server calculation...');
          syncWithServer();
          setLastMinuteAlert(false);
          
          // Play appropriate sound based on what just finished
          if (clientIsOnBreak) {
            playSound('levelChange'); // Break ended, back to regular play
          } else {
            // Check if next level is a break
            const nextLevel = currentTournament.structure.levels[clientLevelIndex + 1];
            if (nextLevel?.isBreak) {
              playSound('breakStart');
            } else {
              playSound('levelChange');
            }
          }
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTournament, syncWithServer, lastMinuteAlert, playSound, clientIsOnBreak, clientLevelIndex]);

  // Periodic server sync (less frequent now since it's more reliable)
  useEffect(() => {
    if (!currentTournament?.isRunning || currentTournament?.isPaused) return;

    const syncInterval = setInterval(() => {
      console.log('🔄 Periodic mathematical sync with break support');
      syncWithServer();
    }, 60000); // Sync every minute

    return () => clearInterval(syncInterval);
  }, [currentTournament?.isRunning, currentTournament?.isPaused, syncWithServer]);

  return {
    clientTimeRemaining,
    clientLevelIndex,
    clientIsOnBreak,
    lastMinuteAlert,
    breakTimeRemaining
  };
}
