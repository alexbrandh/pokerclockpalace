
import { useCallback } from 'react';
import { useSupabaseTournament } from '@/contexts/SupabaseTournamentContext';
import { useSoundSystem } from '@/hooks/useSoundSystem';

export function useTournamentPlayerActions() {
  const { currentTournament, updateTournamentState } = useSupabaseTournament();
  const { playSound } = useSoundSystem();

  const addPlayer = useCallback(() => {
    if (!currentTournament) return;
    
    playSound('buttonClick');
    
    updateTournamentState({
      players: currentTournament.players + 1,
      entries: currentTournament.entries + 1,
      currentPrizePool: currentTournament.currentPrizePool + currentTournament.structure.buyIn
    });
  }, [currentTournament, playSound, updateTournamentState]);

  const eliminatePlayer = useCallback(() => {
    if (!currentTournament || currentTournament.players <= 0) return;
    
    playSound('buttonClick');
    
    updateTournamentState({
      players: currentTournament.players - 1
    });
  }, [currentTournament, playSound, updateTournamentState]);

  const addReentry = useCallback(() => {
    if (!currentTournament) return;
    
    playSound('buttonClick');
    
    updateTournamentState({
      players: currentTournament.players + 1,
      reentries: currentTournament.reentries + 1,
      currentPrizePool: currentTournament.currentPrizePool + currentTournament.structure.reentryFee
    });
  }, [currentTournament, playSound, updateTournamentState]);

  return {
    addPlayer,
    eliminatePlayer,
    addReentry
  };
}
